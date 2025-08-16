import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';

const config: INestiaConfig = {
  output: "src/api",
  input: () => NestFactory.create(AppModule),
};

export default config;