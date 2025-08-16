import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginRequest } from './dto/login.request';
import type { Request, Response } from 'express';
import { BaseResponse } from '@/shared/dto/base-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @Post('signup')
  @HttpCode(201)
  async signup(@Body() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return new BaseResponse(201, '회원가입 성공', result);
  }

  @Post('login')
  async login(
    @Body() dto: LoginRequest
  ) {
    const result = await this.authService.login(dto);
    return new BaseResponse(200, '로그인 성공', result);
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    const result = this.authService.refresh(refreshToken);
    return new BaseResponse(200, 'refresh 성공', result);
  }
}