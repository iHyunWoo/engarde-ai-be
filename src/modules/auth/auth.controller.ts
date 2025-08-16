import { Controller, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginRequest } from './dto/login.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TypedBody, TypedHeaders, TypedRoute } from '@nestia/core';
import { parseCookie } from '@/modules/auth/lib/parse-cookie';
import { RefreshHeaders } from '@/modules/auth/dto/refresh.headers';

type Headers = Record<string, string | string[] | undefined>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @TypedRoute.Post('signup')
  @HttpCode(201)
  async signup(@TypedBody() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return new BaseResponse(201, '회원가입 성공', result);
  }

  @TypedRoute.Post('login')
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
}