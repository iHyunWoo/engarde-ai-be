import { Module } from '@nestjs/common';
import { MarkingsController } from '@/modules/marking/marking.controller';
import { MarkingsService } from '@/modules/marking/marking.service';

@Module({
  controllers: [MarkingsController],
  providers: [MarkingsService],
})
export class MarkingModule {}