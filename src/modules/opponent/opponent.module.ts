import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { OpponentController } from '@/modules/opponent/opponent.controller';
import { OpponentService } from '@/modules/opponent/opponent.service';

@Module({
  imports: [AuthModule],
  controllers: [OpponentController],
  providers: [OpponentService],
  exports: [OpponentService]
})
export class OpponentModule {}