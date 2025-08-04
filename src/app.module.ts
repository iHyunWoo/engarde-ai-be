import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
})
export class AppModule {}
