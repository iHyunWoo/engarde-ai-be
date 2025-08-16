import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class LoginRequest {
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;


  @IsOptional()
  rememberMe?: boolean;
}
