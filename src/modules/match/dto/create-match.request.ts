import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MatchStage as MatchStage } from '@prisma/client';

export class CreateMatchRequest {
  @IsNotEmpty()
  @IsString()
  objectName: string;

  @IsNotEmpty()
  @IsString()
  tournamentName: string;

  @IsDateString()
  tournamentDate: string;

  @IsNotEmpty()
  @IsString()
  opponentName: string;

  @IsNotEmpty()
  @IsString()
  opponentTeam: string;

  @IsNotEmpty()
  @IsNumber()
  myScore: number;

  @IsNotEmpty()
  @IsNumber()
  opponentScore: number;

  @IsNotEmpty()
  @IsString()
  stage: MatchStage;
}
