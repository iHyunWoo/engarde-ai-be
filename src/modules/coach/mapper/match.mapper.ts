import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { MatchStage } from '@prisma/client';
import { TechniqueAttemptResponse } from '@/modules/technique-attempt/dto/technique-attempt.response';

export const mapToGetMatchListRes = (m: MatchMapperInput): GetMatchListResponse => ({
  id: m.id,
  tournamentName: m.tournamentName,
  opponent: m.opponent ?? undefined,
  myScore: m.myScore,
  opponentScore: m.opponentScore,
  tournamentDate: m.tournamentDate,
  stage: m.stage,
});

export const mapToGetMatchRes = (m: MatchMapperInput): GetMatchResponse => ({
  id: m.id,
  objectName: m.objectName,
  tournamentName: m.tournamentName,
  tournamentDate: m.tournamentDate.toISOString(),
  opponent: m.opponent ?? undefined,
  myScore: m.myScore,
  opponentScore: m.opponentScore,
  techniqueAttempt: m.techniqueAttempt ?? [],
  createdAt: m.createdAt.toISOString(),
  stage: m.stage,
  coachFeedback: m.coachFeedback,
});

export interface MatchMapperInput {
  id: number;
  coachFeedback: string;
  objectName: string;
  tournamentName: string;
  tournamentDate: Date;
  opponent?: OpponentResponse | undefined;
  myScore: number;
  opponentScore: number;
  userId: number;
  techniqueAttempt?: TechniqueAttemptResponse[];
  stage: MatchStage;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

