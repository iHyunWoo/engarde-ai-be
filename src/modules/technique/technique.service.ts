import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { UpsertTechniqueRequest } from '@/modules/technique/dto/upsert-technique.request';
import { AppError } from '@/shared/error/app-error';
import { DEFAULT_TECHNIQUES } from '@/modules/technique/lib/default-techniques';
import { TechniqueAttemptService } from '@/modules/technique-attempt/technique-attempt.service';

@Injectable()
export class TechniqueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly techniqueAttemptService: TechniqueAttemptService
  ) {
  }

  TECHNIQUE_MAX_COUNT = 30;

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


  async findAll(
    userId: number,
  ): Promise<TechniqueResponse[]> {
    return await this.prisma.technique.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        parent_id: null,
      },
      include: {
        children: {
          where: {
            deleted_at: null
          }
        }
      }
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

    const isDuplicate = await this.prisma.technique.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
        name: dto.name,
        type: dto.type,
        NOT: { id: techniqueId },
      }
    });

    if (isDuplicate) throw new AppError('TECHNIQUE_DUPLICATE');

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

    // 자식들의 id 조회
    const allTechniqueIds = await this.getAllSubTechniqueIds(userId, techniqueId);

    const now = new Date();

    await this.prisma.$transaction([
      // technique soft delete
      this.prisma.technique.updateMany({
        where: {
          id: { in: allTechniqueIds },
        },
        data: {
          deleted_at: now,
        },
      }),
      // technique attempt 에서 참조되는 attempt delete
      this.prisma.techniqueAttempt.updateMany({
        where: {
          technique_id: { in: allTechniqueIds },
          deleted_at: null,
        },
        data: {
          deleted_at: now,
        },
      }),
    ]);

    return {
      id: technique.id,
      name: technique.name,
      type: technique.type,
      children: []
    };
  }

  async create(userId: number, dto: UpsertTechniqueRequest): Promise<TechniqueResponse> {
    const techniqueCount = await this.prisma.technique.count({
      where: {
        user_id: userId,
        deleted_at: null
      }
    })

    const isDuplicate = await this.prisma.technique.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
        name: dto.name,
        type: dto.type,
      }
    });

    if (isDuplicate) throw new AppError('TECHNIQUE_DUPLICATE');

    if (techniqueCount >= this.TECHNIQUE_MAX_COUNT) throw new AppError('TECHNIQUE_MAX')
    return await this.prisma.technique.create({
      data: {
        user_id: userId,
        name: dto.name,
        type: dto.type,
        parent_id: dto.parentId,
      }
    })
  }

  async setDefaultTechnique(userId: number) {
    await this.prisma.technique.createMany({
      data: DEFAULT_TECHNIQUES.map((technique) => ({
        ...technique,
        user_id: userId,
        parent_id: null
      })),
    });
  }

  private async getAllSubTechniqueIds(userId: number, rootId: number): Promise<number[]> {
    const result: number[] = [rootId];
    const stack: number[] = [rootId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const children = await this.prisma.technique.findMany({
        where: {
          user_id: userId,
          parent_id: current,
          deleted_at: null,
        },
        select: { id: true },
      });

      for (const child of children) {
        result.push(child.id);
        stack.push(child.id);
      }
    }

    return result;
  }

}