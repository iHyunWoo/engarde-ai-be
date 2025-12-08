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
import { TechniqueService } from '@/modules/technique/technique.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cookieJar: CookieJar,
    private readonly techniqueService: TechniqueService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) throw new ConflictException('This email already exists.');

    // Team invite code 체크
    const team = await this.prisma.team.findFirst({ where: {
      inviteCode: dto.inviteCode,
      inviteCodeExpiresAt: {
        gt: new Date(),
      },
      deletedAt: null,
    } });

    // Admin invite code 체크
    const adminUser = await this.prisma.user.findFirst({ where: {
      adminInviteCode: dto.inviteCode,
      adminInviteCodeExpiresAt: {
        gt: new Date(),
      },
      deletedAt: null,
      role: 'ADMIN',
    } });

    if (!team && !adminUser) throw new ConflictException('Invalid invite code.');

    const hashed = await this.hashPassword(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashed,
        teamId: team?.id ?? null, // admin invite code면 null
      },
    });

    // 생성된 유저에 default 기술 넣기
    await this.techniqueService.setDefaultTechnique(newUser.id)

    return;
  }

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user)
      throw new UnauthorizedException('The email or password is incorrect.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
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

  /**
   * 로그아웃 처리 - 쿠키 삭제
   */
  logout() {
    // 쿠키를 삭제하기 위해 빈 값과 maxAge 0으로 설정
    this.cookieJar.set('access_token', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 0,
    });

    this.cookieJar.set('refresh_token', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 0,
    });

    return;
  }

  /**
   * 비밀번호를 검증하고 암호화합니다.
   * 회원가입 및 코치 계정 생성 시 사용됩니다.
   * @param password 평문 비밀번호
   * @returns 암호화된 비밀번호 해시
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}