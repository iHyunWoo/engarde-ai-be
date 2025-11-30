import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { StatisticController } from '@/modules/statistic/statistic.controller';
import { StatisticService } from '@/modules/statistic/statistic.service';
import { MatchModule } from '@/modules/match/match.module';

@Module({
  imports: [AuthModule, MatchModule],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}