import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginRequest } from './dto/login.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginResponse } from '@/modules/auth/dto/login.response';
import { CookieJar } from '@/shared/lib/http/cookie-jar';
import { AppError } from '@/shared/error/app-error';
import { JwtPayload } from '@/modules/auth/guards/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cookieJar: CookieJar,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) throw new ConflictException('This email already exists.');

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password_hash: hashed,
      },
    });
    return;
  }

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user)
      throw new UnauthorizedException('The email or password is incorrect.');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid)
      throw new UnauthorizedException('The email or password is incorrect.');

    this.issueTokens(user.id, dto.rememberMe);

    return { userId: user.id, name: user.name };
  }

  refresh(refreshToken?: string) {
    if (!refreshToken) throw new AppError('TOKEN_MISSING')

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new AppError('TOKEN_MISSING')
    }

    this.issueTokens(payload.userId);

    return;
  }

  private issueTokens(userId: number, rememberMe = false) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ userId }, {
        expiresIn: rememberMe ? '30d' : '1d',
      },
    );

    this.cookieJar.set('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    this.cookieJar.set('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
  }
}