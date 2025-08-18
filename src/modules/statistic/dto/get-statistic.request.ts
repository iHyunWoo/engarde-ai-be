import { IsDateString } from 'class-validator';

export class GetStatisticRequest {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}