import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { Event } from "../../events/entities/event.entity";

@Entity("tickets")
@Unique(["event", "row", "seatNumber"])
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.tickets, {
    onDelete: "CASCADE",
  })
  booking: Booking;

  @ManyToOne(() => Event, (event) => event.tickets, { onDelete: "CASCADE" })
  event: Event;

  @Column()
  row: string;

  @Column("int")
  seatNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}
