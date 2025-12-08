import {
  Result as MarkingResult,
  MarkingQuality as MarkingQuality,
} from '@prisma/client';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';

export class MarkingResponse {
  id: number;
  timestamp: number;
  result: MarkingResult;
  myTechnique: TechniqueResponse | null;
  opponentTechnique: TechniqueResponse | null;
  quality: MarkingQuality;
  note: string;
  coachNote: string;
  remainTime: number;
}

