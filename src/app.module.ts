import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MatchModule } from '@/modules/match/match.module';
import { FileModule } from '@/modules/file/file.module';
import { MarkingModule } from '@/modules/marking/marking.module';
import { NoteModule } from '@/modules/note/note.module';
import { StatisticModule } from '@/modules/statistic/statistic.module';

@Module({
  imports: [PrismaModule, AuthModule, MatchModule, FileModule, MarkingModule, NoteModule, StatisticModule],
})
export class AppModule {}
