import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailRequest {
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}

