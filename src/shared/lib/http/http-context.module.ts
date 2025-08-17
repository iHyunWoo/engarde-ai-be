import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CookieJar } from './cookie-jar';
import { CookieCommitInterceptor } from './cookie-commit.interceptor';

@Global()
@Module({
  providers: [
    CookieJar,
    { provide: APP_INTERCEPTOR, useClass: CookieCommitInterceptor },
  ],
  exports: [CookieJar],
})
export class HttpContextModule {}