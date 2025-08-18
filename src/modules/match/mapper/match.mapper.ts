import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { DeleteMatchResponse } from '@/modules/match/dto/delete-match.response';
import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { Match } from '@prisma/client';
import { TechniqueAttemptResponse } from '@/modules/technique-attempt/dto/technique-attempt.response';


export const mapToGetMatchListRes = (m: MatchMapperInput): GetMatchListResponse => ({
  id: m.id,
  tournamentName: m.tournament_name,
  opponent: m.opponent ?? undefined,
  myScore: m.my_score,
  opponentScore: m.opponent_score,
  tournamentDate: m.tournament_date,
});

export const mapToGetMatchRes = (m: MatchMapperInput): GetMatchResponse => ({
  id: m.id,
  objectName: m.object_name,
  tournamentName: m.tournament_name,
  tournamentDate: m.tournament_date.toISOString(),
  opponent: m.opponent ?? undefined,
  myScore: m.my_score,
  opponentScore: m.opponent_score,
  techniqueAttempt: m.techniqueAttempt ?? [],
  createdAt: m.created_at.toISOString(),
});

export const mapToDeleteRes = (m: Match): DeleteMatchResponse => ({
  id: m.id,
  deletedAt: m.deleted_at?.toISOString() ?? "",
});

interface MatchMapperInput {
  id: number
  object_name: string
  tournament_name: string
  tournament_date: Date
  opponent?: OpponentResponse | undefined
  my_score: number
  opponent_score: number
  user_id: number
  techniqueAttempt?: TechniqueAttemptResponse[]
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}