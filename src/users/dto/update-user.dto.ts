import { IsString, IsBoolean, IsOptional } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
