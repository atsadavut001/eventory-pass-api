import {
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  Length,
} from "class-validator";
import { Type } from "class-transformer";

export class SeatSelectionDto {
  @IsString()
  @Length(1, 1)
  @IsNotEmpty()
  row: string; // 'A' through 'F'

  @IsInt()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  seatNumber: number; // 1 through 10
}

export class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  expiry: string;

  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4, {
    message: "You can select a maximum of 4 seats per booking",
  })
  @ValidateNested({ each: true })
  @Type(() => SeatSelectionDto)
  seats: SeatSelectionDto[];

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;
}
