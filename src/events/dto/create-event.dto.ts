import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
  IsUrl,
} from "class-validator";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  dateTime: string;

  @IsUrl()
  @IsNotEmpty()
  posterUrl: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  ticketPrice: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}
