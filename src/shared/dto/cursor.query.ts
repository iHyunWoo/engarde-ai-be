import { IsNumber } from 'class-validator';

export class CursorQuery {
  @IsNumber()
  limit: number;

  @IsNumber()
  cursor?: undefined | number;
}