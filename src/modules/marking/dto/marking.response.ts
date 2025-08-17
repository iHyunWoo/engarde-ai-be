import {
  Result as MarkingResult,
  MarkingType as MarkingType,
  MarkingQuality as MarkingQuality,
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

