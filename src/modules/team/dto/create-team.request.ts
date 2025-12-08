import { IsString, IsOptional, IsDateString, MaxLength, MinLength, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}