import { Module } from '@nestjs/common';
import { MarkingsController } from '@/modules/marking/marking.controller';
import { MarkingsService } from '@/modules/marking/marking.service';
import { NoteModule } from '@/modules/note/note.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule, NoteModule],
  controllers: [MarkingsController],
  providers: [MarkingsService],
})
export class MarkingModule {}