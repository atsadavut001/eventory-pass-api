import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Booking } from "../../bookings/entities/booking.entity";
import { Ticket } from "../../bookings/entities/ticket.entity";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  dateTime: Date;

  @Column()
  posterUrl: string;

  @Column("decimal", { precision: 10, scale: 2 })
  ticketPrice: number;

  @Column("text")
  description: string;

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
