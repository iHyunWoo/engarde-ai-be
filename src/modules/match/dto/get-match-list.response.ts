import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { MatchStage as MatchStage } from '@prisma/client';

export class GetMatchListResponse {
  id: number;
  tournamentName: string;
  opponent: OpponentResponse | undefined;
  myScore: number;
  opponentScore: number;
  tournamentDate: Date;
  stage: MatchStage;
}