import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';

export interface GetStatisticResponse {
  matchCount: number;
  opponentStats: OpponentStat[]
  winRate: WinRateStatisticsResponse;
  lossCount: LossCountStatisticsResponse;
}

export interface TopNotesDTO {
  note: string;
  count: number;
}

export interface WinRateByTechniqueDto {
  name: string;
  attemptCount: number;
  winCount: number;
  topNotes: TopNotesDTO[];
  isMainTechnique: boolean;
}

export interface LossCountByTechniqueDto {
  name: string;
  count: number;
  topNotes: TopNotesDTO[];
  isMainTechnique: boolean;
}

export type WinRateStatisticsResponse = Record<number, WinRateByTechniqueDto>;
export type LossCountStatisticsResponse = Record<number, LossCountByTechniqueDto>;

export interface TechniqueStat {
  id: number;
  name: string;
  count: number;
  isMainTechnique: boolean;
}

export interface OpponentStat {
  opponent: OpponentResponse;
  totalMatches: number;
  wins: number;
  loses: number;
  averageScore: {
    preliminary: {
      myScore: number;
      opponentScore: number;
  },
    main: {
      myScore: number;
      opponentScore: number;
    },
  };
  topWinTechniques: TechniqueStat[]
  topLoseTechniques: TechniqueStat[]
}