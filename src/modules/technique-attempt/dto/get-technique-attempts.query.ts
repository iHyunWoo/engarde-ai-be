import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetTechniqueAttemptsQuery {

  @IsNotEmpty()
  @IsNumber()
  matchId: number
}