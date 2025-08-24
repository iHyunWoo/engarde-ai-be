import { Module } from '@nestjs/common';
import { MatchController } from '@/modules/match/match.controller';
import { MatchService } from '@/modules/match/match.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { OpponentModule } from '@/modules/opponent/opponent.module';

@Module({
  imports: [AuthModule, OpponentModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService]
})
export class MatchModule {}