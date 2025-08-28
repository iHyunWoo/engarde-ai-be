import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMatchByOpponentQuery {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  opponentId: number;
}