import { CreateMatchRequest } from '@/modules/match/dto/create-match.request';
import { Match } from '@prisma/client';

export function createMatch(
  userId: number,
  count = 1,
  overrides?: Partial<CreateMatchRequest>
): Match[] | Match {
  const base = createMatchRequest()

  const generateOne = (index: number): Match => ({
    id: index,
    userId,
    objectName: overrides?.objectName ?? base.objectName,
    tournamentName: overrides?.tournamentName ?? `${base.tournamentName} - ${index + 1}`,
    tournamentDate: new Date(overrides?.tournamentDate ?? base.tournamentDate),
    opponentId: index + 100,
    myScore: overrides?.myScore ?? base.myScore + index,
    opponentScore: overrides?.opponentScore ?? base.opponentScore + index,
    stage: overrides?.stage ?? base.stage,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  if (count === 1) return generateOne(0);

  return Array.from({ length: count }, (_, i) => generateOne(i));
}

export function createMatchRequest(): CreateMatchRequest {
  return {
    objectName: 'video-name',
    tournamentName: '2025 서울 오픈',
    tournamentDate: '2025-08-28T00:00:00.000Z',
    opponentTeam: '서울시청',
    opponentName: '김지훈',
    myScore: 15,
    opponentScore: 10,
    stage: 'main',
  };
}