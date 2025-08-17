import { Injectable, Scope } from '@nestjs/common';

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  domain?: string;
  path?: string;
  maxAge?: number;   // ms
  expires?: Date;    // Date는 헤더로만 쓰여 바디 직렬화와 무관
};

export type CookieRecord = { name: string; value: string; options?: CookieOptions };

@Injectable({ scope: Scope.REQUEST })
export class CookieJar {
  private list: CookieRecord[] = [];

  set(name: string, value: string, options?: CookieOptions) {
    this.list.push({ name, value, options });
  }
  
  drain(): CookieRecord[] {
    const out = this.list;
    this.list = [];
    return out;
  }
}