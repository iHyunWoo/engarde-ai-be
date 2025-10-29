import { IsOptional, IsString } from 'class-validator';

export class GenerateAdminInviteCodeRequest {
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

