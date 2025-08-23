import {
  MarkingQuality,
  Result as MarkingResult,
} from '@prisma/client';
import { MarkingResponse } from '@/modules/marking/dto/marking.response';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';

export function mapToMarkingRes(row: MarkingMapperInput): MarkingResponse {
  return {
    id: row.id,
    timestamp: row.timestamp,
    result: row.result,
    myTechnique: row.my_technique,
    opponentTechnique: row.opponent_technique,
    quality: row.quality,
    note: row.note,
    remainTime: row.remain_time,
  };
}

export function mapToMarkingResList(rows: MarkingMapperInput[]): MarkingResponse[] {
  return rows.map(mapToMarkingRes);
}

interface MarkingMapperInput{
  id: number
  match_id: number
  timestamp: number
  result: MarkingResult
  my_technique: TechniqueResponse | null
  opponent_technique: TechniqueResponse | null
  quality: MarkingQuality
  remain_time: number
  note: string
}