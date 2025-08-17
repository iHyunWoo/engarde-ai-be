import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { Response } from 'express';
import { tap } from 'rxjs/operators';
import { CookieJar } from './cookie-jar';

@Injectable({ scope: Scope.REQUEST })
export class CookieCommitInterceptor implements NestInterceptor {
  constructor(private readonly jar: CookieJar) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const res = ctx.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap(() => {
        for (const c of this.jar.drain()) {
          res.cookie(c.name, c.value, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            ...c.options,
          });
        }
      }),
    );
  }
}