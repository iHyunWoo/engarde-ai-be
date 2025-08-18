export interface WinRateByTechniqueDto {
  name: string;
  attemptCount: number;
  winCount: number;
  topNotes: string[];
}

export interface LossCountByTechniqueDto {
  name: string;
  count: number;
  topNotes: string[];
}

export type WinRateStatisticsResponse = Record<number, WinRateByTechniqueDto>;
export type LossCountStatisticsResponse = Record<number, LossCountByTechniqueDto>;

export class GetStatisticResponse {
  matchCount: number;
  winRate?: WinRateStatisticsResponse;
  lossCount?: LossCountStatisticsResponse;
}