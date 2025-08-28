import { makeApp } from '@/test/e2e/_helpers/make-app.helper';
import { INestApplication } from '@nestjs/common';
import * as api from '@/../api-sdk';

let app: INestApplication;
let host: string;
let cookie: string;

export const getApp = () => app;
export const getHost = () => host;
export const getCookie = () => cookie;

export async function setupApp(): Promise<void> {
  app = await makeApp();

  const port = app.getHttpServer().address().port;
  host = `http://localhost:${port}/api`;

  try {
    await api.functional.auth.signup(
      {
        host: getHost()
      }, {
        email: 'test@test.com',
        name: '테스트',
        password: 'qwe123!@#',
      }
    )
  } catch(e) {
  }
}

export async function loginAndSetCookie(): Promise<void> {
  const res = await fetch(`${host}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'qwe123!@#',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('로그인 쿠키 없음');
  cookie = setCookie;
}