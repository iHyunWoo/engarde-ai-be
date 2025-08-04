import { Module } from '@nestjs/common';
import { PrismaModule } from '@/lib/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
