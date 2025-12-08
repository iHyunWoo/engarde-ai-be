import { IsString, IsOptional, IsDateString, MaxLength, MinLength, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTeamRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxMembers?: number;
}