import {
  Result as MarkingResult,
  MarkingType as MarkingType,
  MarkingQuality as MarkingQuality,
  Marking,
} from '@prisma/client';

export class MarkingResponse {
  id: number;
  timestamp: number;
  result: MarkingResult;
  myType: MarkingType;
  opponentType: MarkingType;
  quality: MarkingQuality;
  note: string;
  remainTime: number;
}

export function toMarkingResponse(row: Marking): MarkingResponse {
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

export function toMarkingList(rows: Marking[]): MarkingResponse[] {
  return rows.map(toMarkingResponse);
}