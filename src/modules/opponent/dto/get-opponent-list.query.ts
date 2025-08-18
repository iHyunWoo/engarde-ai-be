import { IsNumber } from 'class-validator';

export class GetOpponentListQuery {
  @IsNumber()
  limit: number;

  @IsNumber()
  cursor?: undefined | number;
}