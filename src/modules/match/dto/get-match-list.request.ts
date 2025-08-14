import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class GetMatchListRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  cursor?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}