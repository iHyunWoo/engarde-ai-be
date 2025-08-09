import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MatchModule } from '@/modules/match/match.module';
import { FileModule } from '@/modules/file/file.module';

@Module({
  imports: [PrismaModule, AuthModule, MatchModule, FileModule],
})
export class AppModule {}
