import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum StatsScope {
  ALL = 'all',
  ATTEMPT = 'attempt',
  LOSE = 'lose',
}

export class GetStatisticRequest {
  @IsOptional()
  @IsEnum(StatsScope)
  scope: StatsScope = StatsScope.ALL;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}