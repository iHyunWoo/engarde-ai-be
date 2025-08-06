import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   */
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res() res: Response) {
    const result = await this.authService.signup(dto);
    const response = new BaseResponse(201, '회원가입 성공', result);
    return res.status(201).json(response);
  }

  /**
   * 로그인: jwt token 쿠키 발급
   */
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto, res);
    const response = new BaseResponse(200, '로그인 성공', result);
    return res.status(200).json(response);
  }

  /**
   * 토큰 재발급
   */
  @Post('refresh')
  refresh(@Req() req: Request, @Res() res: Response) {
    console.log(req.cookies);
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Refresh token이 없습니다');

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const result = this.authService.refresh(payload.userId, res);
      const response = new BaseResponse(200, 'refresh 성공', result);
      return res.status(200).json(response);
    } catch {
      throw new UnauthorizedException('Refresh token이 유효하지 않습니다');
    }

  }
}