import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AppError } from '@/shared/error/app-error';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new AppError('UNAUTHORIZED');
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!userRecord) {
      throw new AppError('USER_NOT_FOUND');
    }

    return requiredRoles.some((role) => userRecord.role === role);
  }
}
