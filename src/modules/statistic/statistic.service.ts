import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import {
  LossCountStatisticsResponse, TopNotesDTO,
  WinRateByTechniqueDto,
  WinRateStatisticsResponse,
} from '@/modules/statistic/dto/get-statistic.response';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

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
      existing.attemptCount += attempt.attemptCount;
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
      if (!note?.trim()) continue;

      if (!topNotes[my_technique_id]) {
        topNotes[my_technique_id] = [];
      }

      topNotes[my_technique_id].push({ note, count: row._count });
    }

    return topNotes;
  }
}
