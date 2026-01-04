import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@engarde-ai.com';
  }

  /**
   * 이메일 인증 메일 발송
   */
  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.engarde-ai.com';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>이메일 인증</h2>
          <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            이메일 인증하기
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            이 링크는 24시간 후에 만료됩니다.
          </p>
        </div>
      `,
    });
  }

  /**
   * 비밀번호 재설정 메일 발송
   */
  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.engarde-ai.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: '비밀번호 재설정',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>비밀번호 재설정</h2>
          <p>비밀번호를 재설정하려면 아래 버튼을 클릭해주세요.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            비밀번호 재설정하기
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            이 링크는 1시간 후에 만료됩니다.
            만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.
          </p>
        </div>
      `,
    });
  }
}

