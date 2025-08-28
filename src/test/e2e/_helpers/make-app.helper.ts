import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import cookieParser from 'cookie-parser';
import { AppErrorFilter, HttpErrorFilter } from '@/shared/filters/http-exception.filter';

export async function makeApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.use(cookieParser());

  app.useGlobalFilters(new AppErrorFilter());
  app.useGlobalFilters(new HttpErrorFilter());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://www.engarde-ai.com'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  await app.listen(4000);
  return app;
}