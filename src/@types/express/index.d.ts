import 'express';
import type { JwtPayload } from '@/auth/types';

declare module 'express' {
  interface Request {
    cookies: Record<string, string>;
    user?: JwtPayload;
  }
}