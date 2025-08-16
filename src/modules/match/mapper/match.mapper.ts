import type { Match } from '@prisma/client';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';
import { CreateMatchRequest } from '@/modules/match/dto/create-match.request';
import { GetMatchResponse } from '@/modules/match/dto/get-match.response';
import { DeleteMatchResponse } from '@/modules/match/dto/delete-match.response';
import { UpdateCounterResponse } from '@/modules/match/dto/update-counter.response';


export const mapToGetMatchListRes = (m: Match): GetMatchListResponse => ({
  id: m.id,
  tournamentName: m.tournament_name,
  opponentName: m.opponent_name,
  opponentTeam: m.opponent_team,
  myScore: m.my_score,
  opponentScore: m.opponent_score,
  tournamentDate: m.tournament_date,
});

export const mapToGetMatchRes = (m: Match): GetMatchResponse => ({
  id: m.id,
  objectName: m.object_name,
  tournamentName: m.tournament_name,
  tournamentDate: m.tournament_date.toISOString(),
  opponentName: m.opponent_name,
  opponentTeam: m.opponent_team,
  myScore: m.my_score,
  opponentScore: m.opponent_score,
  attackAttemptCount: m.attack_attempt_count,
  parryAttemptCount: m.parry_attempt_count,
  counterAttackAttemptCount: m.counter_attack_attempt_count,
  createdAt: m.created_at.toISOString(),
});

export const mapCreateReqToMatch = (userId: number, dto: CreateMatchRequest) => ({
  user_id: userId,
  object_name: dto.objectName ?? null,
  tournament_name: dto.tournamentName,
  tournament_date: new Date(dto.tournamentDate),
  opponent_name: dto.opponentName,
  opponent_team: dto.opponentTeam ?? null,
  my_score: dto.myScore,
  opponent_score: dto.opponentScore,
  attack_attempt_count: 0,
  parry_attempt_count: 0,
  counter_attack_attempt_count: 0,
});

export const mapToDeleteRes = (m: Match): DeleteMatchResponse => ({
  id: m.id,
  deletedAt: m.deleted_at?.toISOString() ?? "",
});

export const mapToUpdateCounterRes = (m: Match): UpdateCounterResponse => ({
  id: m.id,
  attackAttemptCount: m.attack_attempt_count,
  parryAttemptCount: m.parry_attempt_count,
  counterAttackAttemptCount: m.counter_attack_attempt_count,
  updatedAt: m.updated_at,
});