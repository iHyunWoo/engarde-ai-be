import { Module } from '@nestjs/common';
import { FileController } from '@/modules/file/file.controller';
import { FileService } from '@/modules/file/file.service';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}