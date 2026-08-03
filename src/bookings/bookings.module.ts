import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { Booking } from "./entities/booking.entity";
import { Ticket } from "./entities/ticket.entity";
import { Event } from "../events/entities/event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Ticket, Event])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
