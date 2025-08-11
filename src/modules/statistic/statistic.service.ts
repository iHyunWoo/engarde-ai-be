import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { GetStatisticRequest, StatsScope } from '@/modules/statistic/dto/get-statistic.request';
import { GetStatisticResponse } from '@/modules/statistic/dto/get-statistic.response';
import { MarkingType } from '@prisma/client';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {
  }

  async getStatistics(
    userId: number,
    query: GetStatisticRequest
  ) {
    const { from: fromString, to: toString, scope } = query
    const from = new Date(fromString)
    const to = new Date(toString)

    const matchWhere = {
      user_id: userId,
      tournament_date: { gte: from, lte: to },
      deleted_at: null
    }

    const matches = await this.prisma.match.findMany({
      select: { id: true },
      where: matchWhere
    })
    const matchIds = matches.map(match => match.id);

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
        }
      })

      // win 마킹 수
      const winByType = await this.prisma.marking.groupBy({
        by: ["my_type"],
        where: {
          user_id: userId,
          match_id: { in: matchIds },
          result: 'win',
          deleted_at: null,
        },
        _count: { _all: true },
      })

      const winCountByType = (type: MarkingType) => {
        return winByType.find(marking => marking.my_type === type)?._count._all ?? 0
      }
      const attackWinCount = winCountByType('lunge') + winCountByType('advanced_lunge') + winCountByType('fleche') + winCountByType('push')
      const parryWinCount = winCountByType('parry')
      const counterAttackWinCount = winCountByType('counter_attack')

      // 상위 노트 3개
      const notes = await this.prisma.marking.groupBy({
        by: ['note'],
        where: {
          user_id: userId,
          match_id: { in: matchIds },
          result: 'win',
          deleted_at: null,
          note: { not: '' },
        },
        _count: { note: true },
        orderBy: { _count: { note: 'desc' } },
        take: 3
      })

      
      const topNotes = notes
        .map(n => ({ note: n.note, count: n._count.note }))

      res.attempt = {
        attackAttemptCount: agg._sum.attack_attempt_count ?? 0,
        parryAttemptCount: agg._sum.parry_attempt_count ?? 0,
        counterAttackAttemptCount: agg._sum.counter_attack_attempt_count ?? 0,
        attackWinCount,
        parryWinCount,
        counterAttackWinCount,
        topNotes: topNotes,
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
          deleted_at: null
        },
        _count: { opponent_type: true }
      })

      const loseCountByType = (type: MarkingType) => {
        return loseByType.find(marking => marking.opponent_type === type)?._count.opponent_type ?? 0;
      }

      const notes = await this.prisma.marking.groupBy({
        by: ['note'],
        where: {
          user_id: userId,
          match_id: { in: matchIds },
          result: 'lose',
          deleted_at: null,
          note: { not: '' },
        },
        _count: { note: true },
        orderBy: { _count: { note: 'desc' } },
        take: 3,
      })

      const topNotes = notes
        .map(n => ({ note: n.note, count: n._count.note }))

      res.lose = {
        lungeLoseCount: loseCountByType('lunge'),
        advancedLungeLoseCount: loseCountByType('advanced_lunge'),
        flecheLoseCount: loseCountByType('fleche'),
        pushLoseCount: loseCountByType('push'),
        parryLoseCount: loseCountByType('parry'),
        counterAttackLoseCount: loseCountByType('counter_attack'),
        topNotes: topNotes
      }
    }

    return res;
  }

}