import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) throw new ConflictException('이미 존재하는 이메일입니다');

    const hashed = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password_hash: hashed,
      },
    });
    return { message: '회원가입 성공', userId: newUser.id };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');

    this.issueTokens(user.id, res, dto.rememberMe);

    return { message: '로그인 성공', userId: user.id };
  }

  refresh(userId: number, res: Response) {
    this.issueTokens(userId, res);

    return { message: '토큰 재발급 성공' };
  }

  private issueTokens(userId: number, res: Response, rememberMe = false) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ userId }, {
        expiresIn: rememberMe ? '30d' : '1d',
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
  }
}