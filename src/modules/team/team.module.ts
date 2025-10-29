import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { RolesGuard } from '@/shared/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [TeamController],
  providers: [TeamService, PrismaService, RolesGuard],
  exports: [TeamService],
})
export class TeamModule {}
