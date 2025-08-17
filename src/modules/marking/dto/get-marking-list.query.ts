import { IsNumber } from 'class-validator';

export class GetMarkingListQuery {
  @IsNumber()
  matchId: number;
}