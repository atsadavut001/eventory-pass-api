import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async onModuleInit() {
    const count = await this.eventsRepository.count();
    if (count === 0) {
      await this.eventsRepository.save([
        {
          name: "Summer Jazz Nights",
          dateTime: new Date("2026-08-15T19:30:00Z"),
          posterUrl:
            "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
          ticketPrice: 45.0,
          description:
            "Experience an evening of exceptional jazz music under the stars with our award-winning quartet. Immerse yourself in the smooth melodies and vibrant atmosphere.",
        },
        {
          name: "Tech Innovation Summit 2026",
          dateTime: new Date("2026-09-10T09:00:00Z"),
          posterUrl:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
          ticketPrice: 120.0,
          description:
            "Join industry leaders, developers, and designers to explore the future of technology, AI, and agentic workflows. Features keynotes, panels, and networking.",
        },
        {
          name: "Broadway Musical Showcase",
          dateTime: new Date("2026-10-05T18:00:00Z"),
          posterUrl:
            "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800",
          ticketPrice: 75.0,
          description:
            "A spectacular evening featuring classic and modern hits from your favorite Broadway musicals, performed by an elite cast of theatrical vocalists.",
        },
      ]);
      console.log("Database seeded with 3 default events.");
    }
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      order: { dateTime: "ASC" },
    });
  }

  async findOne(id: string): Promise<
    Omit<Event, "tickets"> & {
      bookedSeats: { row: string; seatNumber: number }[];
    }
  > {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ["tickets"],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Map tickets relation to bookedSeats array
    const bookedSeats = event.tickets.map((ticket) => ({
      row: ticket.row,
      seatNumber: ticket.seatNumber,
    }));

    // Remove direct tickets relation from returned object to match API contract clean output
    const { tickets, ...eventDetails } = event;

    return {
      ...eventDetails,
      bookedSeats,
    };
  }

  // Helper method to find simple Event entity without mapping mapped fields
  async findRaw(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findRaw(id);
    Object.assign(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findRaw(id);
    await this.eventsRepository.remove(event);
  }
}
