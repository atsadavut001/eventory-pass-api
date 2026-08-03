import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsUrl,
} from "class-validator";

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  dateTime?: string;

  @IsUrl()
  @IsOptional()
  posterUrl?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  ticketPrice?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
