import { Module } from '@nestjs/common';
import { MatchController } from '@/modules/match/match.controller';
import { MatchService } from '@/modules/match/match.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { OpponentModule } from '@/modules/opponent/opponent.module';
import { FileModule } from '@/modules/file/file.module';
import { CloudRunModule } from '@/modules/cloud-run/cloud-run.module';
import { MatchJobController } from '@/modules/match/match-job.controller';

@Module({
  imports: [AuthModule, OpponentModule, FileModule, CloudRunModule],
  controllers: [MatchController, MatchJobController],
  providers: [MatchService],
  exports: [MatchService]
})
export class MatchModule {}