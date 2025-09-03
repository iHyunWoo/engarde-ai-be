import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import {
  LossCountStatisticsResponse, OpponentStat, TopNotesDTO,
  WinRateByTechniqueDto,
  WinRateStatisticsResponse,
} from '@/modules/statistic/dto/get-statistic.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { MatchStage as MatchStage } from '@prisma/client';
import { StatisticSummary, TechniquesByMatch } from '@/modules/statistic/dto/get-statistics-v2.response';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    userId: number,
    matchIds: number[],
  ): Promise<StatisticSummary> {
    return await this.getTopTechniques(userId, matchIds, 30)
  }

  async getTechniquesByMatch(
    userId: number,
    matches: GetMatchListResponse[]
  ): Promise<TechniquesByMatch[]> {
    const result: TechniquesByMatch[] = []

    for (const match of matches) {
      const summary = await this.getTopTechniques(userId, [match.id], 30)
      result.push({
        match: match,
        summary: summary
      })
    }

    return result
  }

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
        userId: userId,
        matchId: { in: matchIds },
        deletedAt: null,
        technique: {
          deletedAt: null,
        },
      },
      include: {
        technique: true,
      },
    });

    // Marking 테이블에서 각 기술 별 성공 횟수를 가져옴
    const winMarkings = await this.prisma.marking.findMany({
      where: {
        userId: userId,
        matchId: { in: matchIds },
        result: 'win',
        deletedAt: null,
        myTechnique: {
          deletedAt: null,
        },
      },
      include: {
        myTechnique: true,
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
        isMainTechnique: false
      };
      existing.attemptCount += attempt.attemptCount;
      existing.isMainTechnique = attempt.technique.parentId === null
      statsMap.set(id, existing);
    }

    // 기술 별 성공 횟수 집계
    for (const marking of winMarkings) {
      const technique = marking.myTechnique;
      if (!technique) continue;

      const { id, name } = technique;
      const existing: WinRateByTechniqueDto = statsMap.get(id) ?? {
        name,
        attemptCount: 0,
        winCount: 0,
        topNotes: [],
        isMainTechnique: false
      };
      existing.winCount += 1;
      existing.isMainTechnique = marking.myTechnique?.parentId === null
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
        isMainTechnique: data.isMainTechnique
      };
    }

    return result;
  }



  async getLossTypes(userId: number, matchIds: number[]): Promise<LossCountStatisticsResponse> {
    // Loss 마킹 중 상대방 기술 가져오기
    const lossMarkings = await this.prisma.marking.findMany({
      where: {
        userId: userId,
        matchId: { in: matchIds },
        result: 'lose',
        deletedAt: null,
        opponentTechnique: { deletedAt: null }
      },
      include: {
        opponentTechnique: true,
      },
    });

    const statsMap = new Map<number, { name: string; count: number, isMainTechnique: boolean }>();
    console.log(lossMarkings);
    // 기술별 횟수 집계
    for (const marking of lossMarkings) {
      const technique = marking.opponentTechnique;
      if (!technique) continue;

      const { id, name } = technique;
      const existing = statsMap.get(id) ?? { name, count: 0, isMainTechnique: false };
      existing.count += 1;
      existing.isMainTechnique = marking.opponentTechnique?.parentId === null
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
        isMainTechnique: data.isMainTechnique
      };
    }

    return result;
  }


  // 기술 별 해당 마킹의 Note 중 상위 빈도 note 가져오기
  private async getTopNotesByTechnique(userId: number, matchIds: number[], take: number = 3) {
    const rows = await this.prisma.marking.groupBy({
      by: ['myTechniqueId', 'note'],
      where: {
        userId: userId,
        matchId: { in: matchIds },
        result: 'win',
        note: { not: '' },
        deletedAt: null,
      },
      _count: true,
      orderBy: {
        _count: { note: 'desc' },
      },
      take: take
    });

    const topNotes: Record<number, TopNotesDTO[]> = {};

    for (const row of rows) {
      const { myTechniqueId, note } = row;
      if (!note?.trim() || !myTechniqueId) continue;

      if (!topNotes[myTechniqueId]) {
        topNotes[myTechniqueId] = [];
      }

      topNotes[myTechniqueId].push({ note, count: row._count });
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
  private async getTopTechniques(userId: number, matchIds: number[], take: number = 3) {
    const markings = await this.prisma.marking.findMany({
      where: {
        matchId: { in: matchIds },
        userId: userId,
        deletedAt: null,
      },
      select: {
        result: true,
        myTechnique: {
          select: { id: true, name: true, parentId: true, deletedAt: true },
        },
        opponentTechnique: {
          select: { id: true, name: true, parentId: true, deletedAt: true },
        },
      },
    });

    const winCounts: Record<number, { name: string; count: number, isMainTechnique: boolean }> = {};
    const loseCounts: Record<number, { name: string; count: number, isMainTechnique: boolean }> = {};
    for (const m of markings) {
      if (m.result === 'win' && m.myTechnique && m.myTechnique.deletedAt === null) {
        const id = m.myTechnique.id;
        const name = m.myTechnique.name;
        winCounts[id] = {
          name,
          count: (winCounts[id]?.count || 0) + 1,
          isMainTechnique: m.myTechnique.parentId === null
        };
      }

      if (m.result === 'lose' && m.opponentTechnique && m.opponentTechnique.deletedAt === null) {
        const id = m.opponentTechnique.id;
        const name = m.opponentTechnique.name;
        loseCounts[id] = {
          name,
          count: (loseCounts[id]?.count || 0) + 1,
          isMainTechnique: m.opponentTechnique.parentId === null
        };
      }
    }

    const topWins = Object.entries(winCounts)
      .map(([id, { name, count, isMainTechnique }]) => ({ id: +id, name, count, isMainTechnique }))
      .sort((a, b) => b.count - a.count)
      .slice(0, take);

    const topLoses = Object.entries(loseCounts)
      .map(([id, { name, count, isMainTechnique }]) => ({ id: +id, name, count, isMainTechnique }))
      .sort((a, b) => b.count - a.count)
      .slice(0, take);

    return {
      win: topWins,
      lose: topLoses,
    };
  }
}
