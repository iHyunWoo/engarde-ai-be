import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const accessToken = req.cookies?.['access_token'] as string | undefined;
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;

    if (!accessToken) {
      if (!refreshToken) {
        // token이 모두 없으면
        throw new UnauthorizedException('TOKEN_MISSING');
      }

      // access는 없고 refresh는 있으면
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }
  }
}