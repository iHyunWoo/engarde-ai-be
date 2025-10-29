import { IsOptional, IsDateString } from 'class-validator';

export class GenerateInviteCodeRequest {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
