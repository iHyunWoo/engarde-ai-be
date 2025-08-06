import 'express';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';

declare module 'express' {
  interface Request {
    cookies: Record<string, string>;
    user?: JwtPayload;
  }
}