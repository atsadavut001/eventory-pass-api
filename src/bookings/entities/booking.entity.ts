import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";
import { Ticket } from "./ticket.entity";

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Event, (event) => event.bookings, { onDelete: "CASCADE" })
  event: Event;

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: "confirmed" })
  status: string;

  @OneToMany(() => Ticket, (ticket) => ticket.booking, { cascade: true })
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
