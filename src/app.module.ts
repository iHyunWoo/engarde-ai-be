import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { MatchModule } from '@/modules/match/match.module';
import { FileModule } from '@/modules/file/file.module';
import { MarkingModule } from '@/modules/marking/marking.module';
import { NoteModule } from '@/modules/note/note.module';
import { StatisticModule } from '@/modules/statistic/statistic.module';
import { HttpContextModule } from '@/shared/lib/http/http-context.module';
import { OpponentModule } from '@/modules/opponent/opponent.module';
import { TechniqueModule } from '@/modules/technique/technique.module';
import { TechniqueAttemptModule } from '@/modules/technique-attempt/technique-attempt.module';
import { TeamModule } from '@/modules/team/team.module';
import { UserModule } from '@/modules/user/user.module';
import { AdminModule } from '@/modules/admin/admin.module';

@Module({
  imports: [
    HttpContextModule,
    PrismaModule,
    AuthModule,
    MatchModule,
    FileModule,
    MarkingModule,
    NoteModule,
    StatisticModule,
    OpponentModule,
    TechniqueModule,
    TechniqueAttemptModule,
    TeamModule,
    UserModule,
    AdminModule,
  ],
})
export class AppModule {}
