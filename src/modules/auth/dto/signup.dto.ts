import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '유효한 이메일 형식이어야 합니다' })
  @IsNotEmpty({ message: '이메일은 필수입니다' })
  email: string;

  @IsNotEmpty({ message: '이름은 필수입니다' })
  name: string;

  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다' })
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  password: string;
}
