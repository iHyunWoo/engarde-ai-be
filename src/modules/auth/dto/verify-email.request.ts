import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailRequest {
  @IsNotEmpty({ message: 'Verification token is required.' })
  @IsString()
  token: string;
}

