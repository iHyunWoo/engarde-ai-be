import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MatchModule } from '@/modules/match/match.module';

@Module({
  imports: [PrismaModule, AuthModule, MatchModule],
})
export class AppModule {}
