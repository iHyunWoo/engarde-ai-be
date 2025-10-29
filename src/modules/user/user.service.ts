import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AppError } from '@/shared/error/app-error';
import { UpdateUserRequest } from './dto/update-user.request';
import { mapToUserResponse } from '@/modules/user/mapper/user.mapper';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    return mapToUserResponse(user);
  }

  async updateMyProfile(userId: number, dto: UpdateUserRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return mapToUserResponse(updated);
  }
}
