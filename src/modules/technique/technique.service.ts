import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { UpsertTechniqueRequest } from '@/modules/technique/dto/upsert-technique.request';
import { AppError } from '@/shared/error/app-error';

@Injectable()
export class TechniqueService {
  constructor(private readonly prisma: PrismaService) {
  }

  async suggest(userId: number, query: string): Promise<TechniqueResponse[]> {
    return this.prisma.technique.findMany({
      take: 5,
      where: {
        user_id: userId,
        deleted_at: null,
        name: { contains: query, mode: 'insensitive' }
      },
      orderBy: [
        { last_used_at: 'desc' },
        { name: 'asc' }
      ]
    })
  }

  async findAllByPagination(
    userId: number,
    limit: number,
    cursor?: number,
  ): Promise<CursorResponse<TechniqueResponse>> {
    const take = limit ?? 10;

    const techniques = await this.prisma.technique.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        parent_id: null,
      },
      orderBy: { id: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        children: {
          where: {
            deleted_at: null
          }
        }
      }
    });

    const hasNextPage = techniques.length > take;
    const trimmed = hasNextPage ? techniques.slice(0, -1) : techniques;

    return {
      items: trimmed,
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async update(userId: number, techniqueId: number, dto: UpsertTechniqueRequest): Promise<TechniqueResponse> {
    const technique = await this.prisma.technique.findFirst({
      where: {
        id: techniqueId,
        user_id: userId,
        deleted_at: null
      }
    })

    if (!technique) throw new AppError('TECHNIQUE_NOT_FOUND')

    return await this.prisma.technique.update({
      where: {
        id: techniqueId
      },
      data: {
        name: dto.name,
        type: dto.type,
        parent_id: dto.parentId,
        last_used_at: new Date()
      }
    })
  }

  async useTechnique(techniqueId: number) {
    await this.prisma.technique.update({
      where: {
        id: techniqueId
      },
      data: {
        last_used_at: new Date()
      }
    })
  }

  async delete(userId: number, techniqueId: number): Promise<TechniqueResponse> {
    const technique = await this.prisma.technique.findFirst({
      where: {
        user_id: userId,
        id: techniqueId,
        deleted_at: null
      }
    })

    if (!technique) throw new AppError('TECHNIQUE_NOT_FOUND')
    return await this.prisma.technique.update({
      where: {
        id: techniqueId
      },
      data: {
        deleted_at: new Date()
      }
    })
  }

  async create(userId: number, dto: UpsertTechniqueRequest): Promise<TechniqueResponse> {
    return await this.prisma.technique.create({
      data: {
        user_id: userId,
        name: dto.name,
        type: dto.type,
        parent_id: dto.parentId,
      }
    })
  }


}