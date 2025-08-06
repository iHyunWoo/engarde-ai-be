import { Module } from '@nestjs/common';
import { MatchController } from '@/modules/match/match.controller';
import { MatchService } from '@/modules/match/match.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}