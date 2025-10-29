import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetAllTeamsRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cursor?: number;

  @IsOptional()
  @IsString()
  q?: string;
}

