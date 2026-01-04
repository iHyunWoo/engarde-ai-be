import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendPasswordResetRequest {
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}

