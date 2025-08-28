import { PrismaClient } from '@prisma/client';

export const prismaTestClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});