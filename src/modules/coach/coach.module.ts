import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StatisticModule } from '../statistic/statistic.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [AuthModule, PrismaModule, StatisticModule, MatchModule],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}

