import { Module } from '@nestjs/common';
import { NoteController } from '@/modules/note/note.controller';
import { NoteService } from '@/modules/note/note.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}