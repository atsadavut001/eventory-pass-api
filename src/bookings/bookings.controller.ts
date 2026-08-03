import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReqUser } from "../auth/decorators/user.decorator";
import { User } from "../users/entities/user.entity";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @ReqUser() user: User) {
    return this.bookingsService.create(createBookingDto, user);
  }

  @Get("my")
  findAllMy(
    @ReqUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.bookingsService.findAllMy(user.id, page, limit);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string, @ReqUser() user: User) {
    return this.bookingsService.findOne(id, user.id);
  }
}
