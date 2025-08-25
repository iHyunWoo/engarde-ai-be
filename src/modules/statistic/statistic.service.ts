import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import {
  LossCountStatisticsResponse, OpponentStat, TopNotesDTO,
  WinRateByTechniqueDto,
  WinRateStatisticsResponse,
} from '@/modules/statistic/dto/get-statistic.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { MatchStage as MatchStage } from '@prisma/client';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatisticsByOpponent(userId: number, matches: GetMatchListResponse[]): Promise<OpponentStat[]> {
    const grouped = this.groupMatchesByOpponent(matches);
    const result: OpponentStat[] = [];

    for (const [, opponentMatches] of grouped) {
      const opponent = opponentMatches[0].opponent!;
      const matchIds = opponentMatches.map((m) => m.id);

      const basicStats = this.computeStats(opponentMatches);
      const topTechniques = await this.getTopTechniques(userId, matchIds);

      result.push({
        opponent,
        totalMatches: opponentMatches.length,
        wins: basicStats.wins,
        loses: basicStats.loses,
        averageScore: basicStats.averageScore,
        topWinTechniques: topTechniques.win,
        topLoseTechniques: topTechniques.lose,
      });
    }

    return result;
  }


  // 각 기술 별 성공률
  async getWinRateByTechnique(userId: number, matchIds: number[]): Promise<WinRateStatisticsResponse> {
    // 각 기술 별 시도 횟수
    const attempts = await this.prisma.techniqueAttempt.findMany({
      where: {
        user_id: userId,
        match_id: { in: matchIds },
        deleted_at: null,
      },
      include: {
        technique: true,
      },
    });

    // Marking 테이블에서 각 기술 별 성공 횟수를 가져옴
    const winMarkings = await this.prisma.marking.findMany({
      where: {
        user_id: userId,
        match_id: { in: matchIds },
        result: 'win',
        deleted_at: null,
      },
      include: {
        my_technique: true,
      },
    });

    const statsMap = new Map<number, WinRateByTechniqueDto>();
    // 기술 별 시도 횟수 집계
    for (const attempt of attempts) {
      const { id, name } = attempt.technique;
      const existing: WinRateByTechniqueDto = statsMap.get(id) ?? {
        name,
        attemptCount: 0,
        winCount: 0,
        topNotes: [],
      };
      existing.attemptCount += attempt.attempt_count;
      statsMap.set(id, existing);
    }

    // 기술 별 성공 횟수 집계
    for (const marking of winMarkings) {
      const technique = marking.my_technique;
      if (!technique) continue;

      const { id, name } = technique;
      const existing: WinRateByTechniqueDto = statsMap.get(id) ?? {
        name,
        attemptCount: 0,
        winCount: 0,
        topNotes: [],
      };
      existing.winCount += 1;
      statsMap.set(id, existing);
    }

    const topNotesMap = await this.getTopNotesByTechnique(userId, matchIds)

    // 결과 변환
    const result: WinRateStatisticsResponse = {};
    for (const [id, data] of statsMap.entries()) {
      result[id] = {
        name: data.name,
        attemptCount: data.attemptCount,
        winCount: data.winCount,
        topNotes: topNotesMap[id] ?? [],
      };
    }

    return result;
  }



  async getLossTypes(userId: number, matchIds: number[]): Promise<LossCountStatisticsResponse> {
    // Loss 마킹 중 상대방 기술 가져오기
    const lossMarkings = await this.prisma.marking.findMany({
      where: {
        user_id: userId,
        match_id: { in: matchIds },
        result: 'lose',
        deleted_at: null,
      },
      include: {
        opponent_technique: true,
      },
    });

    const statsMap = new Map<number, { name: string; count: number }>();

    // 기술별 횟수 집계
    for (const marking of lossMarkings) {
      const technique = marking.opponent_technique;
      if (!technique) continue;

      const { id, name } = technique;
      const existing = statsMap.get(id) ?? { name, count: 0 };
      existing.count += 1;
      statsMap.set(id, existing);
    }

    // 기술별 상위 노트
    const topNotes = await this.getTopNotesByTechnique(userId, matchIds);


    const result: LossCountStatisticsResponse = {};
    for (const [id, data] of statsMap.entries()) {
      result[id] = {
        name: data.name,
        count: data.count,
        topNotes: topNotes[id] ?? [],
      };
    }

    return result;
  }


  // 기술 별 해당 마킹의 Note 중 상위 빈도 note 가져오기
  private async getTopNotesByTechnique(userId: number, matchIds: number[], take: number = 3) {
    const rows = await this.prisma.marking.groupBy({
      by: ['my_technique_id', 'note'],
      where: {
        user_id: userId,
        match_id: { in: matchIds },
        result: 'win',
        note: { not: '' },
        deleted_at: null,
      },
      _count: true,
      orderBy: {
        _count: { note: 'desc' },
      },
      take: take
    });

    const topNotes: Record<number, TopNotesDTO[]> = {};

    for (const row of rows) {
      const { my_technique_id, note } = row;
      if (!note?.trim() || !my_technique_id) continue;

      if (!topNotes[my_technique_id]) {
        topNotes[my_technique_id] = [];
      }

      topNotes[my_technique_id].push({ note, count: row._count });
    }

    return topNotes;
  }

  // 경기를 Opponent 별로 grouping
  private groupMatchesByOpponent(matches: GetMatchListResponse[]) {
    const grouped = new Map<number, GetMatchListResponse[]>();
    for (const match of matches) {
      const opponentId = match.opponent?.id;
      if (!opponentId) continue;
      if (!grouped.has(opponentId)) {
        grouped.set(opponentId, []);
      }
      grouped.get(opponentId)!.push(match);
    }
    return grouped;
  }

  // 경기들의 스탯 계산
  private computeStats(matches: GetMatchListResponse[]) {
    let wins = 0, loses = 0;
    let preMy = 0, preOpp = 0, preCnt = 0;  // 예선 스탯
    let mainMy = 0, mainOpp = 0, mainCnt = 0;  // 본선 스탯

    for (const match of matches) {
      if (match.myScore > match.opponentScore) wins++;
      else if (match.myScore < match.opponentScore) loses++;

      if (match.stage === MatchStage.preliminary) {
        preMy += match.myScore;
        preOpp += match.opponentScore;
        preCnt++;
      } else if (match.stage === MatchStage.main) {
        mainMy += match.myScore;
        mainOpp += match.opponentScore;
        mainCnt++;
      }
    }

    return {
      wins,
      loses,
      averageScore: {
        preliminary: {
          myScore: preCnt > 0 ? preMy / preCnt : 0,
          opponentScore: preCnt > 0 ? preOpp / preCnt : 0,
        },
        main: {
          myScore: mainCnt > 0 ? mainMy / mainCnt : 0,
          opponentScore: mainCnt > 0 ? mainOpp / mainCnt : 0,
        }
      }
    };
  }

  // 경기들의 승패 시 각각 최대 승리 본인 기술, 최대 패배 상대 기술
  private async getTopTechniques(userId: number, matchIds: number[]) {
    const markings = await this.prisma.marking.findMany({
      where: {
        match_id: { in: matchIds },
        user_id: userId,
        deleted_at: null,
      },
      select: {
        result: true,
        my_technique: {
          select: { id: true, name: true, deleted_at: true },
        },
        opponent_technique: {
          select: { id: true, name: true, deleted_at: true },
        },
      },
    });

    const winCounts: Record<number, { name: string; count: number }> = {};
    const loseCounts: Record<number, { name: string; count: number }> = {};
    for (const m of markings) {
      if (m.result === 'win' && m.my_technique && m.my_technique.deleted_at === null) {
        const id = m.my_technique.id;
        const name = m.my_technique.name;
        winCounts[id] = {
          name,
          count: (winCounts[id]?.count || 0) + 1,
        };
      }

      if (m.result === 'lose' && m.opponent_technique && m.opponent_technique.deleted_at === null) {
        const id = m.opponent_technique.id;
        const name = m.opponent_technique.name;
        loseCounts[id] = {
          name,
          count: (loseCounts[id]?.count || 0) + 1,
        };
      }
    }

    const topWins = Object.entries(winCounts)
      .map(([id, { name, count }]) => ({ id: +id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const topLoses = Object.entries(loseCounts)
      .map(([id, { name, count }]) => ({ id: +id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      win: topWins,
      lose: topLoses,
    };
  }
}
