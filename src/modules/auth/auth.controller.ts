import { Controller, HttpCode, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginRequest } from './dto/login.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TypedBody, TypedHeaders, TypedRoute } from '@nestia/core';
import { parseCookie } from '@/modules/auth/lib/parse-cookie';
import { RefreshHeaders } from '@/modules/auth/dto/refresh.headers';
import { VerifyEmailRequest } from './dto/verify-email.request';
import { SendPasswordResetRequest } from './dto/send-password-reset.request';
import { ResetPasswordRequest } from './dto/reset-password.request';

type Headers = Record<string, string | string[] | undefined>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @TypedRoute.Post('signup')
  @HttpCode(201)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1분에 5번만 허용
  async signup(@TypedBody() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return new BaseResponse(201, '회원가입 성공', result);
  }

  @TypedRoute.Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1분에 5번만 허용
  async login(
    @TypedBody() dto: LoginRequest
  ) {
    const result = await this.authService.login(dto);
    return new BaseResponse(200, '로그인 성공', result);
  }

  @TypedRoute.Post('refresh')
  refresh(@TypedHeaders() headers: RefreshHeaders) {
    const cookies = parseCookie(headers['cookie']);
    const refreshToken = cookies['refresh_token'];
    const result = this.authService.refresh(refreshToken);
    return new BaseResponse(200, 'refresh 성공', result);
  }

  @TypedRoute.Post('logout')
  @HttpCode(200)
  logout() {
    this.authService.logout();
    return new BaseResponse(200, '로그아웃 성공');
  }

  @TypedRoute.Post('verify-email')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 4 * 60 * 1000 } }) // 4분에 1번만 허용
  async verifyEmail(@TypedBody() dto: VerifyEmailRequest) {
    const result = await this.authService.verifyEmail(dto);
    return new BaseResponse(200, '이메일 인증 성공', result);
  }

  @TypedRoute.Post('send-password-reset')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 4 * 60 * 1000 } }) // 4분에 1번만 허용
  async sendPasswordReset(@TypedBody() dto: SendPasswordResetRequest) {
    const result = await this.authService.sendPasswordResetEmail(dto);
    return new BaseResponse(200, '비밀번호 재설정 이메일이 발송되었습니다', result);
  }

  @TypedRoute.Post('reset-password')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async resetPassword(@TypedBody() dto: ResetPasswordRequest) {
    const result = await this.authService.resetPassword(dto);
    return new BaseResponse(200, '비밀번호 재설정 성공', result);
  }
}