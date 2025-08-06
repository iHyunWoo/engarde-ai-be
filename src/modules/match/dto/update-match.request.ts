import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMatchRequestDto {
  @IsNotEmpty()
  @IsString()
  tournament_name: string;

  @IsDateString()
  tournament_date: string;

  @IsNotEmpty()
  @IsString()
  opponent_name: string;

  @IsNotEmpty()
  @IsString()
  opponent_team: string;

  @IsOptional()
  @IsInt()
  my_score?: number;

  @IsOptional()
  @IsInt()
  opponent_score?: number;

  @IsOptional()
  @IsInt()
  attack_attempt_count?: number;

  @IsOptional()
  @IsInt()
  parry_attempt_count?: number;

  @IsOptional()
  @IsInt()
  counter_attack_attempt_count?: number;
}
