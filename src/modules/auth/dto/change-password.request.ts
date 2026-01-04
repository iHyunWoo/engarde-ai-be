import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @IsNotEmpty({ message: 'Current password is required.' })
  currentPassword: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsNotEmpty({ message: 'New password is required.' })
  newPassword: string;
}

