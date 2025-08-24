import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TechniqueAttemptController } from '@/modules/technique-attempt/technique-attempt.controller';
import { TechniqueAttemptService } from '@/modules/technique-attempt/technique-attempt.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [TechniqueAttemptController],
  providers: [TechniqueAttemptService],
  exports: [TechniqueAttemptService]
})
export class TechniqueAttemptModule {}