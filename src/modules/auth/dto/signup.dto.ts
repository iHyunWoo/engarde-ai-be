import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @IsNotEmpty({ message: 'Invite code is required.' })
  inviteCode: string;
}
