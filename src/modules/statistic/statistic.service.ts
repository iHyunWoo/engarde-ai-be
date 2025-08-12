import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import {
  GetStatisticRequest,
  StatsScope,
} from '@/modules/statistic/dto/get-statistic.request';
import { GetStatisticResponse } from '@/modules/statistic/dto/get-statistic.response';
import { MarkingType, Result as MarkingResult } from '@prisma/client';
import { toTopNotes } from '@/modules/statistic/lib/to-top-notes';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(userId: number, query: GetStatisticRequest) {
    const { from: fromString, to: toString, scope } = query;
    const from = new Date(fromString);
    const to = new Date(toString);

    // scope에 해당하는 경기 가져오기
    const matchWhere = {
      user_id: userId,
      tournament_date: { gte: from, lte: to },
      deleted_at: null,
    };

    const matches = await this.prisma.match.findMany({
      select: { id: true },
      where: matchWhere,
    });
    const matchIds = matches.map((match) => match.id);

    const res: GetStatisticResponse = {};

    // ATTEMPT
    if (scope === StatsScope.ALL || scope === StatsScope.ATTEMPT) {
      // 시도 합계
      const agg = await this.prisma.match.aggregate({
        where: matchWhere,
        _sum: {
          attack_attempt_count: true,
          parry_attempt_count: true,
          counter_attack_attempt_count: true,
        },
      });

      // win 마킹 수
      const winByType = await this.prisma.marking.groupBy({
        by: ['my_type'],
        where: {
          user_id: userId,
          match_id: { in: matchIds },
          result: 'win',
          deleted_at: null,
        },
        _count: { _all: true },
      });

      // 승리 수 계산
      const winCountByType = (type: MarkingType) => {
        return (
          winByType.find((marking) => marking.my_type === type)?._count._all ??
          0
        );
      };

      const attackWinCount =
        winCountByType('lunge') +
        winCountByType('advanced_lunge') +
        winCountByType('fleche') +
        winCountByType('push');
      const parryWinCount = winCountByType('parry');
      const counterAttackWinCount = winCountByType('counter_attack');

      // 각 타입 별 상위 노트 가져오기
      const attemptNotes = await this.getAttemptTopNotes(userId, matchIds);

      res.attempt = {
        attackAttemptCount: agg._sum.attack_attempt_count ?? 0,
        parryAttemptCount: agg._sum.parry_attempt_count ?? 0,
        counterAttackAttemptCount: agg._sum.counter_attack_attempt_count ?? 0,
        attackWinCount,
        parryWinCount,
        counterAttackWinCount,
        topNotesByType: attemptNotes,
      };
    }

    // LOSE
    if (scope === StatsScope.ALL || scope === StatsScope.LOSE) {
      const loseByType = await this.prisma.marking.groupBy({
        by: ['opponent_type'],
        where: {
          user_id: userId,
          match_id: { in: matchIds },
          result: 'lose',
          deleted_at: null,
        },
        _count: { opponent_type: true },
      });

      // 패배 수 계산
      const loseCountByType = (type: MarkingType) => {
        return (
          loseByType.find((marking) => marking.opponent_type === type)?._count
            .opponent_type ?? 0
        );
      };

      // 각 타입 별 상위 노트 가져오기
      const loseNotes = await this.getLoseTopNotes(userId, matchIds);

      res.lose = {
        lungeLoseCount: loseCountByType('lunge'),
        advancedLungeLoseCount: loseCountByType('advanced_lunge'),
        flecheLoseCount: loseCountByType('fleche'),
        pushLoseCount: loseCountByType('push'),
        parryLoseCount: loseCountByType('parry'),
        counterAttackLoseCount: loseCountByType('counter_attack'),
        topNotesByType: loseNotes,
      };
    }

    return res;
  }

  // Attack Total/Parry/Counter Attack 별 승리 한 경우 Top3 노트 가져오기
  private async getAttemptTopNotes(userId: number, matchIds: number[]) {
    if (!matchIds.length) {
      return { attack: [], parry: [], counterAttack: [] };
    }

    const [attackRaw, parryRaw, counterRaw] = await Promise.all([
      this.groupTopNotes(userId, matchIds, 'win', {
        in: ['lunge', 'advanced_lunge', 'fleche', 'push'],
      }),
      this.groupTopNotes(userId, matchIds, 'win', 'parry'),
      this.groupTopNotes(userId, matchIds, 'win', 'counter_attack'),
    ]);

    return {
      attack: toTopNotes(attackRaw),
      parry: toTopNotes(parryRaw),
      counterAttack: toTopNotes(counterRaw),
    };
  }

  // 각 패벼 타입 별 Top3 노트 가져오기
  private async getLoseTopNotes(userId: number, matchIds: number[]) {
    if (!matchIds.length) {
      return {
        lunge: [],
        advancedLunge: [],
        fleche: [],
        push: [],
        parry: [],
        counter: [],
      };
    }

    const [lungeRaw, advRaw, flecheRaw, pushRaw, parryRaw, counterRaw] =
      await Promise.all([
        this.groupTopNotes(userId, matchIds, 'lose', 'lunge'),
        this.groupTopNotes(userId, matchIds, 'lose', 'advanced_lunge'),
        this.groupTopNotes(userId, matchIds, 'lose', 'fleche'),
        this.groupTopNotes(userId, matchIds, 'lose', 'push'),
        this.groupTopNotes(userId, matchIds, 'lose', 'parry'),
        this.groupTopNotes(userId, matchIds, 'lose', 'counter_attack'),
      ]);

    return {
      lunge: toTopNotes(lungeRaw),
      advancedLunge: toTopNotes(advRaw),
      fleche: toTopNotes(flecheRaw),
      push: toTopNotes(pushRaw),
      parry: toTopNotes(parryRaw),
      counter: toTopNotes(counterRaw),
    };
  }

  // 각 타입 별 Note를 가져오기 위한 groupBy 공통 함수
  private groupTopNotes(
    userId: number,
    matchIds: number[],
    result: MarkingResult,
    myType: MarkingType | { in: MarkingType[] },
  ) {
    return this.prisma.marking.groupBy({
      by: ['note'],
      where: {
        user_id: userId,
        match_id: { in: matchIds },
        result,
        deleted_at: null,
        note: { not: '' },
        my_type: myType,
      },
      _count: { note: true },
      orderBy: { _count: { note: 'desc' } },
      take: 3,
    });
  }
}
