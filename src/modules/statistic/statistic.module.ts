import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { NoteModule } from '@/modules/note/note.module';
import { StatisticController } from '@/modules/statistic/statistic.controller';
import { StatisticService } from '@/modules/statistic/statistic.service';
import { MarkingModule } from '@/modules/marking/marking.module';

@Module({
  imports: [AuthModule, NoteModule, MarkingModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}