export class GetMatchListResponse {
  id: number;
  tournamentName: string;
  opponentName: string;
  opponentTeam: string;
  myScore: number;
  opponentScore: number;
  thumbnailUrl: string | null;
  tournamentDate: Date;
}