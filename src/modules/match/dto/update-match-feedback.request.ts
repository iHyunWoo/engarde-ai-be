import { IsString, IsOptional } from 'class-validator';

export class UpdateMatchFeedbackRequest {
  @IsOptional()
  @IsString()
  coachFeedback?: string;
}
