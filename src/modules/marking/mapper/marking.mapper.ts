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
    myTechnique: row.myTechnique,
    opponentTechnique: row.opponentTechnique,
    quality: row.quality,
    note: row.note,
    remainTime: row.remainTime,
  };
}

export function mapToMarkingResList(rows: MarkingMapperInput[]): MarkingResponse[] {
  return rows.map(mapToMarkingRes);
}

interface MarkingMapperInput{
  id: number
  matchId: number
  timestamp: number
  result: MarkingResult
  myTechnique: TechniqueResponse | null
  opponentTechnique: TechniqueResponse | null
  quality: MarkingQuality
  remainTime: number
  note: string
}