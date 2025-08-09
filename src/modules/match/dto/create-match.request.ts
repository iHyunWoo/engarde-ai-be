import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMatchRequestDto {
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
}
