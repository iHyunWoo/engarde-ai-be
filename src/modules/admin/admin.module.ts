import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '@/shared/lib/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TechniqueModule } from '../technique/technique.module';

@Module({
  imports: [PrismaModule, AuthModule, TechniqueModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

