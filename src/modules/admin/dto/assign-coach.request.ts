import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignCoachRequest {
  @Type(() => Number)
  @IsInt()
  userId!: number;
}
