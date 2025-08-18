import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { UpsertOpponentRequest } from '@/modules/opponent/dto/upsert-opponent.request';
import { AppError } from '@/shared/error/app-error';
import { Opponent } from '@prisma/client';

@Injectable()
export class OpponentService {
  constructor(private readonly prisma: PrismaService) {
  }

  async suggest(userId: number, query: string): Promise<OpponentResponse[]> {
    return this.prisma.opponent.findMany({
      take: 5,
      where: {
        user_id: userId,
        deleted_at: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { team: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { last_used_at: 'desc' }, // 최근 사용 우선
        { name: 'asc' },
        { team: 'asc' }
      ],
    })
  }

  async findAllByPagination(
    userId: number,
    limit: number,
    cursor?: number,
  ): Promise<CursorResponse<OpponentResponse>> {
    const take = limit ?? 10;

    const matches = await this.prisma.opponent.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: { id: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      select: {
        id: true,
        name: true,
        team: true,
      }
    });

    const hasNextPage = matches.length > take;
    const trimmed = hasNextPage ? matches.slice(0, -1) : matches;

    return {
      items: trimmed,
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async update(userId: number, opponentId: number, dto: UpsertOpponentRequest): Promise<OpponentResponse> {
    const opponent = await this.prisma.opponent.findFirst({
      where: {
        id: opponentId,
        user_id: userId,
        deleted_at: null,
      }
    })

    if (!opponent) throw new AppError('OPPONENT_NOT_FOUND')

    return await this.prisma.opponent.update({
      where: {
        id: opponentId
      },
      data: {
        name: dto.name,
        team: dto.name,
        last_used_at: new Date()
      }
    })
  }

  async useOpponent(opponentId: number) {
    await this.prisma.opponent.update({
      where: {
        id: opponentId
      },
      data: {
        last_used_at: new Date()
      }
    })
  }

  async findOrCreate(
    userId: number,
    name: string,
    team: string,
  ): Promise<Opponent> {
    const existing = await this.prisma.opponent.findFirst({
      where: {
        user_id: userId,
        name,
        team,
        deleted_at: null,
      },
    });

    if (existing) return existing;

    return this.prisma.opponent.create({
      data: {
        user_id: userId,
        name,
        team,
      },
    });
  }

  async delete(userId: number, opponentId: number): Promise<OpponentResponse> {
    const opponent = await this.prisma.opponent.findFirst({
      where: {
        user_id: userId,
        id: opponentId,
        deleted_at: null
      }
    })

    if (!opponent) throw new AppError('OPPONENT_NOT_FOUND')
    return await this.prisma.opponent.update({
      where: {
        id: opponentId
      },
      data: {
        deleted_at: new Date()
      }
    })
  }

  async create(userId: number, dto: UpsertOpponentRequest): Promise<OpponentResponse> {
    return await this.prisma.opponent.create({
      data: {
        user_id: userId,
        name: dto.name,
        team: dto.team
      }
    })
  }
}