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
        userId: userId,
        deletedAt: null,
        name: { contains: query, mode: 'insensitive' }
      },
      orderBy: [
        { lastUsedAt: 'desc' },
        { name: 'asc' }
      ]
    })
  }


  async findAll(
    userId: number,
  ): Promise<TechniqueResponse[]> {
    return await this.prisma.technique.findMany({
      where: {
        userId: userId,
        deletedAt: null,
        parentId: null,
      },
      include: {
        children: {
          where: {
            deletedAt: null
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
        userId: userId,
        deletedAt: null,
        parentId: null,
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
            deletedAt: null
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
        userId: userId,
        deletedAt: null
      }
    })

    if (!technique) throw new AppError('TECHNIQUE_NOT_FOUND')

    const isDuplicate = await this.prisma.technique.findFirst({
      where: {
        userId: userId,
        deletedAt: null,
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
        parentId: dto.parentId,
        lastUsedAt: new Date()
      }
    })
  }

  async useTechnique(techniqueId: number) {
    await this.prisma.technique.update({
      where: {
        id: techniqueId
      },
      data: {
        lastUsedAt: new Date()
      }
    })
  }

  async delete(userId: number, techniqueId: number): Promise<TechniqueResponse> {
    const technique = await this.prisma.technique.findFirst({
      where: {
        userId: userId,
        id: techniqueId,
        deletedAt: null
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
          deletedAt: now,
        },
      }),
      // technique attempt 에서 참조되는 attempt delete
      this.prisma.techniqueAttempt.updateMany({
        where: {
          techniqueId: { in: allTechniqueIds },
          deletedAt: null,
        },
        data: {
          deletedAt: now,
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
        userId: userId,
        deletedAt: null
      }
    })

    const isDuplicate = await this.prisma.technique.findFirst({
      where: {
        userId: userId,
        deletedAt: null,
        name: dto.name,
        type: dto.type,
      }
    });

    if (isDuplicate) throw new AppError('TECHNIQUE_DUPLICATE');

    if (techniqueCount >= this.TECHNIQUE_MAX_COUNT) throw new AppError('TECHNIQUE_MAX')
    return await this.prisma.technique.create({
      data: {
        userId: userId,
        name: dto.name,
        type: dto.type,
        parentId: dto.parentId,
      }
    })
  }

  async setDefaultTechnique(userId: number) {
    await this.prisma.technique.createMany({
      data: DEFAULT_TECHNIQUES.map((technique) => ({
        ...technique,
        userId: userId,
        parentId: null
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
          userId: userId,
          parentId: current,
          deletedAt: null,
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