import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Booking } from "./entities/booking.entity";
import { Ticket } from "./entities/ticket.entity";
import { Event } from "../events/entities/event.entity";
import { User } from "../users/entities/user.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    private dataSource: DataSource,
  ) {}

  async create(createBookingDto: CreateBookingDto, user: User) {
    const { eventId, seats } = createBookingDto;

    if (!seats || seats.length === 0) {
      throw new BadRequestException("At least one seat must be selected");
    }
    if (seats.length > 4) {
      throw new BadRequestException(
        "You can select a maximum of 4 seats per booking",
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction("SERIALIZABLE");

    try {
      // 1. Fetch the Event
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // 2. Check if any selected seat is already booked for this event
      // SQLite handles multiple OR conditions well
      const seatCheckConditions = seats.map((seat) => ({
        event: { id: eventId },
        row: seat.row,
        seatNumber: seat.seatNumber,
      }));

      const alreadyBooked = await queryRunner.manager.find(Ticket, {
        where: seatCheckConditions,
      });

      if (alreadyBooked.length > 0) {
        const bookedDetails = alreadyBooked
          .map((t) => `${t.row}${t.seatNumber}`)
          .join(", ");
        throw new ConflictException(
          `The following seats are already booked: ${bookedDetails}`,
        );
      }

      // 3. Calculate totalPrice
      const totalPrice = Number(event.ticketPrice) * seats.length;

      // 4. Create the Booking
      const booking = queryRunner.manager.create(Booking, {
        user,
        event,
        totalPrice,
        status: "confirmed",
      });
      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // 5. Create and save Tickets/Seat Reservations
      const tickets = seats.map((seat) => {
        return queryRunner.manager.create(Ticket, {
          booking: savedBooking,
          event,
          row: seat.row,
          seatNumber: seat.seatNumber,
        });
      });
      await queryRunner.manager.save(Ticket, tickets);

      // 6. Commit transaction
      await queryRunner.commitTransaction();

      // Return details conforming to API contract
      return {
        bookingId: savedBooking.id,
        eventId: event.id,
        eventName: event.name,
        dateTime: event.dateTime,
        totalPrice: savedBooking.totalPrice,
        status: savedBooking.status,
        tickets: tickets.map((t) => ({
          ticketId: t.id,
          row: t.row,
          seatNumber: t.seatNumber,
        })),
      };
    } catch (error) {
      // Rollback transaction if errors occur
      await queryRunner.rollbackTransaction();

      // Check if error is due to Unique Constraint violation (Postgres code 23505, or SQLite equivalent)
      if (
        error.message &&
        (error.message.includes("UNIQUE") ||
          error.code === "SQLITE_CONSTRAINT" ||
          error.code === "23505")
      ) {
        throw new ConflictException(
          "One or more of the selected seats were booked by another transaction. Please select different seats.",
        );
      }

      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAllMy(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; meta: any }> {
    const [data, totalItems] = await this.bookingsRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ["event", "tickets"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(totalItems / limit);

    // Format output to conform with API contract
    const formattedData = data.map((booking) => ({
      id: booking.id,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt,
      event: {
        id: booking.event.id,
        name: booking.event.name,
        dateTime: booking.event.dateTime,
        posterUrl: booking.event.posterUrl,
      },
      tickets: booking.tickets.map((t) => ({
        row: t.row,
        seatNumber: t.seatNumber,
      })),
    }));

    return {
      data: formattedData,
      meta: {
        totalItems,
        itemCount: formattedData.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<any> {
    const booking = await this.bookingsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ["event", "tickets"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return {
      id: booking.id,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt,
      event: {
        id: booking.event.id,
        name: booking.event.name,
        dateTime: booking.event.dateTime,
        posterUrl: booking.event.posterUrl,
      },
      tickets: booking.tickets.map((t) => ({
        row: t.row,
        seatNumber: t.seatNumber,
      })),
    };
  }
}
