import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AppError } from '@/shared/error/app-error';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { MarkingResponse } from '@/modules/marking/dto/marking.response';
import { mapToGetMatchListRes, mapToGetMatchRes } from './mapper/match.mapper';
import { mapToMarkingRes } from './mapper/marking.mapper';

@Injectable()
export class CoachService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 코치가 특정 유저의 경기 목록을 조회합니다.
   * 코치와 유저의 teamId가 일치해야 합니다.
   */
  async findMatchesByUserId(
    coachUserId: number,
    targetUserId: number,
    limit: number = 10,
    cursor?: number,
    from?: Date,
    to?: Date,
  ): Promise<CursorResponse<GetMatchListResponse>> {
    // 코치 권한 및 팀 일치 확인
    await this.validateCoachTeamAccess(coachUserId, targetUserId);

    const take = limit ?? 10;
    const where = {
      userId: targetUserId,
      deletedAt: null,
      ...(from || to ? {
        tournamentDate: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      } : {}),
    };

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

  /**
   * 코치가 특정 경기를 상세 조회합니다.
   * 코치와 경기 소유 유저의 teamId가 일치해야 합니다.
   */
  async findMatchById(
    coachUserId: number,
    matchId: number,
  ): Promise<GetMatchResponse> {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
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
        techniqueAttempts: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('MATCH_NOT_FOUND');
    }

    // 코치 권한 및 팀 일치 확인
    await this.validateCoachTeamAccess(coachUserId, match.userId);

    return mapToGetMatchRes(match);
  }

  /**
   * 코치가 경기에 피드백을 작성합니다.
   * 코치와 경기 소유 유저의 teamId가 일치해야 합니다.
   */
  async updateMatchFeedback(
    coachUserId: number,
    matchId: number,
    coachFeedback: string,
  ): Promise<GetMatchListResponse> {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
        deletedAt: null,
      },
    });

    if (!match) {
      throw new AppError('MATCH_NOT_FOUND');
    }

    // 코치 권한 및 팀 일치 확인
    await this.validateCoachTeamAccess(coachUserId, match.userId);

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { coachFeedback },
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

    return mapToGetMatchListRes(updated);
  }

  /**
   * 코치가 마킹에 노트를 작성합니다.
   * 코치와 마킹 소유 유저의 teamId가 일치해야 합니다.
   */
  async updateMarkingCoachNote(
    coachUserId: number,
    markingId: number,
    coachNote: string,
  ): Promise<MarkingResponse> {
    const marking = await this.prisma.marking.findUnique({
      where: {
        id: markingId,
        deletedAt: null,
      },
      include: {
        match: true,
      },
    });

    if (!marking) {
      throw new AppError('MARKING_NOT_FOUND');
    }

    // 코치 권한 및 팀 일치 확인
    await this.validateCoachTeamAccess(coachUserId, marking.userId);

    const updated = await this.prisma.marking.update({
      where: { id: markingId },
      data: { coachNote },
      include: {
        myTechnique: true,
        opponentTechnique: true,
      },
    });

    return mapToMarkingRes(updated);
  }

  /**
   * 코치가 특정 유저의 팀에 속해있는지 확인합니다.
   * @throws AppError if coach is not authorized
   */
  private async validateCoachTeamAccess(
    coachUserId: number,
    targetUserId: number,
  ) {
    // 코치 확인
    const coach = await this.prisma.user.findUnique({
      where: { id: coachUserId },
    });

    if (!coach) {
      throw new AppError('USER_NOT_FOUND');
    }

    if (coach.role !== 'COACH') {
      throw new AppError('UNAUTHORIZED');
    }

    // 코치가 관리하는 팀 확인
    const coachTeam = await this.prisma.team.findUnique({
      where: { coachId: coachUserId },
    });

    if (!coachTeam) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 대상 유저 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new AppError('USER_NOT_FOUND');
    }

    if (targetUser.deletedAt) {
      throw new AppError('USER_NOT_FOUND');
    }

    // 같은 팀인지 확인
    if (targetUser.teamId !== coachTeam.id) {
      throw new AppError('UNAUTHORIZED');
    }
  }
}

