import {
  Injectable,
} from '@nestjs/common';
import { CreateMatchRequest } from './dto/create-match.request';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMatchResponseDto } from '@/modules/match/dto/create-match.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import {
  mapCreateReqToMatch,
  mapToDeleteRes,
  mapToGetMatchListRes,
  mapToGetMatchRes, mapToUpdateCounterRes,
} from '@/modules/match/mapper/match.mapper';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { DeleteMatchResponse } from '@/modules/match/dto/delete-match.response';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { UpdateCounterResponse } from '@/modules/match/dto/update-counter.response';
import { AppError } from '@/shared/error/app-error';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMatchRequest): Promise<CreateMatchResponseDto> {
    const match = await this.prisma.match.create({
      data: mapCreateReqToMatch(userId, dto),
    });
    return { id: match.id };
  }

  async update(userId: number, matchId: number, dto: CreateMatchRequest): Promise<CreateMatchResponseDto> {
    const match = await this.prisma.match.update({
      where: {
        id: matchId,
        user_id: userId,
        deleted_at: null
      },
      data: {
        object_name: dto.objectName,
        tournament_name: dto.tournamentName,
        tournament_date: new Date(dto.tournamentDate),
        opponent_name: dto.opponentName,
        opponent_team: dto.opponentTeam,
        my_score: dto.myScore,
        opponent_score: dto.opponentScore,
      }
    })

    return {
      id: match.id
    }
  }

  async delete(userId: number, id: number): Promise<DeleteMatchResponse> {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.user_id) throw new AppError('MATCH_FORBIDDEN');
    if (match.deleted_at) throw new AppError('MATCH_GONE');

    const updated = await this.prisma.match.update({
      where: { id },
      data: { deleted_at: new Date() },
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

    const dateRange =
      from || to
        ? {
          tournament_date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
        : undefined;

    const matches = await this.prisma.match.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        ...(dateRange ?? {}),
      },
      orderBy: {
        id: 'desc',
      },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = matches.length > take;
    const trimmed = hasNextPage ? matches.slice(0, -1) : matches;

    return {
      items: trimmed.map(mapToGetMatchListRes),
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async findOne(userId: number, id: number): Promise<GetMatchResponse> {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.user_id) throw new AppError('MATCH_FORBIDDEN');
    if (match.deleted_at) throw new AppError('MATCH_GONE');

    return mapToGetMatchRes(match);
  }

  async updateCounter(
    userId: number,
    matchId: number,
    type: 'attack_attempt_count' | 'parry_attempt_count' | 'counter_attack_attempt_count',
    delta: number,
  ): Promise<UpdateCounterResponse> {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('MATCH_NOT_FOUND');
    if (userId !== match.user_id) throw new AppError('MATCH_FORBIDDEN');
    if (match.deleted_at) throw new AppError('MATCH_GONE');

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { [type]: { increment: delta } },
    });

    return mapToUpdateCounterRes(updated);
  }
}
