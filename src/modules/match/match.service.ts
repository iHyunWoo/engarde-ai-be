import { Injectable } from '@nestjs/common';
import { CreateMatchRequest } from './dto/create-match.request';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMatchResponseDto } from '@/modules/match/dto/create-match.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import {
  mapToDeleteRes,
  mapToGetMatchListRes,
  mapToGetMatchRes,
} from '@/modules/match/mapper/match.mapper';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { DeleteMatchResponse } from '@/modules/match/dto/delete-match.response';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { AppError } from '@/shared/error/app-error';
import { OpponentService } from '@/modules/opponent/opponent.service';
import { CloudRunService } from '@/modules/cloud-run/cloud-run.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly opponentService: OpponentService,
    private readonly cloudRunService: CloudRunService,
  ) {}

  async create(
    userId: number,
    dto: CreateMatchRequest,
  ): Promise<CreateMatchResponseDto> {
    // 상대를 찾고 없다면 생성
    const opponent = await this.opponentService.findOrCreate(
      userId,
      dto.opponentName,
      dto.opponentTeam
    )

    const match = await this.prisma.match.create({
      data: {
        userId,
        objectName: dto.objectName ?? undefined,
        tournamentName: dto.tournamentName,
        tournamentDate: new Date(dto.tournamentDate),
        opponentId: opponent.id,
        myScore: dto.myScore,
        opponentScore: dto.opponentScore,
        stage: dto.stage,
      },
    });

    await this.opponentService.useOpponent(opponent.id)

    return { id: match.id };
  }

  async update(
    userId: number,
    matchId: number,
    dto: CreateMatchRequest,
  ): Promise<CreateMatchResponseDto> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.userId) throw new AppError('MATCH_FORBIDDEN');
    if (match.deletedAt) throw new AppError('MATCH_GONE');

    // 상대를 찾고 없다면 생성
    const opponent = await this.opponentService.findOrCreate(
      userId,
      dto.opponentName,
      dto.opponentTeam
    )

    if (!opponent) throw new AppError('OPPONENT_NOT_FOUND');

    const updated = await this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        objectName: dto.objectName,
        tournamentName: dto.tournamentName,
        tournamentDate: new Date(dto.tournamentDate),
        opponentId: opponent.id,
        myScore: dto.myScore,
        opponentScore: dto.opponentScore,
        stage: dto.stage,
      },
    });

    await this.opponentService.useOpponent(opponent.id)

    return {
      id: updated.id,
    };
  }

  async delete(userId: number, id: number): Promise<DeleteMatchResponse> {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.userId) throw new AppError('MATCH_FORBIDDEN');
    if (match.deletedAt) throw new AppError('MATCH_GONE');

    const updated = await this.prisma.match.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return mapToDeleteRes(updated);
  }

  async findManyWithPagination(
    userId: number,
    limit: number,
    cursor?: number,
    from?: Date,
    to?: Date,
  ): Promise<CursorResponse<GetMatchListResponse>> {
    const take = limit ?? 10;
    const where = this.buildMatchWhereCondition(userId, from, to);

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: { id: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        opponent: {
          select: {
            id: true,
            name: true,
            team: true,
          },
        },
      },
    });

    const hasNextPage = matches.length > take;
    const trimmed = hasNextPage ? matches.slice(0, -1) : matches;

    return {
      items: trimmed.map(mapToGetMatchListRes),
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async findAllByDateRange(
    userId: number,
    from?: Date,
    to?: Date,
  ): Promise<GetMatchListResponse[]> {
    const where = this.buildMatchWhereCondition(userId, from, to);

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
      include: {
        opponent: {
          select: {
            id: true,
            name: true,
            team: true,
          },
        },
      },
    });

    return matches.map(mapToGetMatchListRes);
  }

  // 조건에 따라 match 조건절을 생성
  private buildMatchWhereCondition(userId: number, from?: Date, to?: Date) {
    const dateRange =
      from || to
        ? {
          tournamentDate: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
        : {};

    return {
      userId,
      deletedAt: null,
      ...dateRange,
    };
  }

  async findOne(userId: number, id: number): Promise<GetMatchResponse> {
    const match = await this.prisma.match.findUnique({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        opponent: {
          select: {
            id: true,
            name: true,
            team: true,
          },
        },
      },
    });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.userId) throw new AppError('MATCH_FORBIDDEN');
    if (match.deletedAt) throw new AppError('MATCH_GONE');

    return mapToGetMatchRes(match);
  }

  async findAllByOpponent(
    userId: number,
    opponentId: number
  ): Promise<GetMatchListResponse[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        userId,
        opponentId,
        deletedAt: null,
      },
      include: {
        opponent: true,
      },
    });

    return matches.map(mapToGetMatchListRes);
  }

  // async requestVideoMerge(
  //   userId: number,
  //   matchId: number,
  //   objectNames: string[],
  // ) {
  //   // match 존재 여부 확인
  //   const match = await this.prisma.match.findUnique({
  //     where: {
  //       id: matchId,
  //       userId,
  //       deletedAt: null,
  //     },
  //     select: { id: true },
  //   });
  //   if (!match) throw new AppError('MATCH_NOT_FOUND');

  //   // pending
  //   await this.prisma.match.update({
  //     where: {
  //       id: matchId,
  //     },
  //     data: {
  //       status: 'pending'
  //     }
  //   })

  //   // Cloud Run Job 트리거
  //   await this.cloudRunService.triggerVideoMergeJob(matchId, objectNames);
  // }

  // async videoMergeDone(
  //   matchId: number,
  //   objectName: string,
  // ) {
  //   return await this.prisma.match.update({
  //     where: {
  //       id: matchId,
  //       deletedAt: null
  //     },
  //     data: {
  //       objectName: objectName,
  //       status: 'completed'
  //     }
  //   })
  // }

  // async videoMergeFailed(
  //   matchId: number,
  // ) {
  //   return await this.prisma.match.update({
  //     where: {
  //       id: matchId,
  //       deletedAt: null
  //     },
  //     data: {
  //       status: 'failed'
  //     }
  //   })
  // }


}
