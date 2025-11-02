import { IsString, IsOptional } from 'class-validator';

export class UpdateMarkingCoachNoteRequest {
  @IsOptional()
  @IsString()
  coachNote?: string;
}
