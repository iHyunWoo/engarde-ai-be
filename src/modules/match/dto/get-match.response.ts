import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { TechniqueAttemptResponse } from '@/modules/technique-attempt/dto/technique-attempt.response';
import { MatchStage as MatchStage } from '@prisma/client';

export class GetMatchResponse {
  id: number;
  objectName: string;
  tournamentName: string;
  tournamentDate: string;
  opponent: OpponentResponse | undefined
  myScore: number;
  opponentScore: number;
  createdAt: string;
  techniqueAttempt: TechniqueAttemptResponse[];
  stage: MatchStage;
  coachFeedback: string;
}