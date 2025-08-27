
import api from '../../api-sdk/src';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  const host = 'http://localhost:8080';
  let app: INestApplication;
  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    await (await app.init()).listen(8080);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth API test', () => {
    it('should return an array of articles', async () => {

      const signUpResponse = await api.functional.auth.signup({ host }, {
        email: "string",
        name: "string",
        password: "string",
      });
      const createdUser = signUpResponse.data;
      console.log("ho" + signUpResponse.message);
      console.log(createdUser);
      expect(createdUser).toBeDefined();
    });
  });
});

