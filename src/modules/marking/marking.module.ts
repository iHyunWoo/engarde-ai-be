import { Module } from '@nestjs/common';
import { MarkingsController } from '@/modules/marking/marking.controller';
import { MarkingsService } from '@/modules/marking/marking.service';
import { NoteModule } from '@/modules/note/note.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TechniqueModule } from '@/modules/technique/technique.module';

@Module({
  imports: [AuthModule, NoteModule, TechniqueModule],
  controllers: [MarkingsController],
  providers: [MarkingsService],
  exports: [MarkingsService]
})
export class MarkingModule {}