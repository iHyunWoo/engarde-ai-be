import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginRequest } from './dto/login.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from '@/modules/auth/dto/login.response';
import { CookieJar } from '@/shared/lib/http/cookie-jar';
import { AppError } from '@/shared/error/app-error';
import { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TechniqueService } from '@/modules/technique/technique.service';
import { EmailService } from '@/shared/lib/email/email.service';
import { randomBytes } from 'crypto';
import { VerifyEmailRequest } from './dto/verify-email.request';
import { SendPasswordResetRequest } from './dto/send-password-reset.request';
import { ResetPasswordRequest } from './dto/reset-password.request';
import { ResendVerificationEmailRequest } from './dto/resend-verification-email.request';
import { ChangePasswordRequest } from './dto/change-password.request';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cookieJar: CookieJar,
    private readonly techniqueService: TechniqueService,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) throw new AppError('EMAIL_ALREADY_EXISTS');

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

    if (!team && !adminUser) throw new AppError('INVALID_INVITE_CODE');

    const hashed = await this.hashPassword(dto.password);
    
    // 이메일 인증 토큰 생성
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 24); // 24시간 후 만료

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashed,
        teamId: team?.id ?? null, // admin invite code면 null
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
      },
    });

    // 생성된 유저에 default 기술 넣기
    await this.techniqueService.setDefaultTechnique(newUser.id);

    // 이메일 인증 메일 발송
    await this.emailService.sendVerificationEmail(dto.email, verificationToken);

    return;
  }

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user)
      throw new AppError('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid)
      throw new AppError('INVALID_CREDENTIALS');

    if (!user.emailVerified) {
      throw new AppError('EMAIL_NOT_VERIFIED');
    }

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
   * 이메일 인증
   */
  async verifyEmail(dto: VerifyEmailRequest) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: dto.token,
      },
    });

    if (!user) {
      throw new AppError('INVALID_VERIFICATION_TOKEN');
    }

    if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < new Date()) {
      throw new AppError('VERIFICATION_TOKEN_EXPIRED');
    }

    if (user.emailVerified) {
      // 이미 인증된 경우 성공으로 처리
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return;
  }

  /**
   * 이메일 인증 재발송
   */
  async resendVerificationEmail(dto: ResendVerificationEmailRequest) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공으로 처리
      return;
    }

    // 이미 인증된 경우 성공으로 처리
    if (user.emailVerified) {
      return;
    }

    // 새로운 인증 토큰 생성
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 24); // 24시간 후 만료

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
      },
    });

    // 이메일 인증 메일 재발송
    await this.emailService.sendVerificationEmail(dto.email, verificationToken);

    return;
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  async sendPasswordResetEmail(dto: SendPasswordResetRequest) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // 보안을 위해 사용자가 존재하지 않아도 성공으로 처리
      return;
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1); // 1시간 후 만료

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: resetTokenExpiresAt,
      },
    });

    // 비밀번호 재설정 이메일 발송
    await this.emailService.sendPasswordResetEmail(dto.email, resetToken);

    return;
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(dto: ResetPasswordRequest) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
      },
    });

    if (!user) {
      throw new AppError('INVALID_RESET_TOKEN');
    }

    if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
      throw new AppError('RESET_TOKEN_EXPIRED');
    }

    const hashed = await this.hashPassword(dto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      },
    });

    return;
  }

  /**
   * 일반 유저 비밀번호 변경
   */
  async changePassword(userId: number, dto: ChangePasswordRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // 현재 비밀번호 확인
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('INVALID_CREDENTIALS');
    }

    // 새 비밀번호 암호화
    const hashed = await this.hashPassword(dto.newPassword);

    // 비밀번호 변경
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashed,
      },
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