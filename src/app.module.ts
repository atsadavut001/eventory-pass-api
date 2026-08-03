import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { BookingsModule } from "./bookings/bookings.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./users/entities/user.entity";
import { Event } from "./events/entities/event.entity";
import { Booking } from "./bookings/entities/booking.entity";
import { Ticket } from "./bookings/entities/ticket.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "production" ? ".env" : ".env.dev",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>(
          "DB_HOST",
          "aws-0-ap-southeast-2.pooler.supabase.com",
        ),
        port: (() => {
          const envPort = configService.get<number>("DB_PORT");
          if (process.env.VERCEL && envPort === 5432) {
            return 6543;
          }
          return envPort || 6543;
        })(),
        username: configService.get<string>(
          "DB_USER",
          "postgres.awxxbopzpdekkmfzjjrw",
        ),
        password: configService.get<string>(
          "DB_PASSWORD",
          "eventory_pass_db_dev_001",
        ),
        database: configService.get<string>("DB_NAME", "postgres"),
        entities: [User, Event, Booking, Ticket],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    BookingsModule,
  ],
})
export class AppModule {}
