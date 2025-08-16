import { Marking } from '@prisma/client';
import { MarkingResponse } from '@/modules/marking/dto/marking.response';

export function mapToMarkingRes(row: Marking): MarkingResponse {
  return {
    id: row.id,
    timestamp: row.timestamp,
    result: row.result,
    myType: row.my_type,
    opponentType: row.opponent_type,
    quality: row.quality,
    note: row.note,
    remainTime: row.remain_time,
  };
}

export function mapToMarkingResList(rows: Marking[]): MarkingResponse[] {
  return rows.map(mapToMarkingRes);
}