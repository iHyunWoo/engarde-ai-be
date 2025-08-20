import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TechniqueService } from '@/modules/technique/technique.service';
import { TechniqueController } from '@/modules/technique/technique.controller';

@Module({
  imports: [AuthModule],
  controllers: [TechniqueController],
  providers: [TechniqueService],
  exports: [TechniqueService]
})
export class TechniqueModule {}