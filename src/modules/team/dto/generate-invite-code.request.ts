import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class GenerateInviteCodeRequest {
  @IsInt()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresAt?: number = 7;
}
