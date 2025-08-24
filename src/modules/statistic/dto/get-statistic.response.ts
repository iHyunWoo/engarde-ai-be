export interface TopNotesDTO {
  note: string;
  count: number;
}

export interface WinRateByTechniqueDto {
  name: string;
  attemptCount: number;
  winCount: number;
  topNotes: TopNotesDTO[];
}

export interface LossCountByTechniqueDto {
  name: string;
  count: number;
  topNotes: TopNotesDTO[];
}

export type WinRateStatisticsResponse = Record<number, WinRateByTechniqueDto>;
export type LossCountStatisticsResponse = Record<number, LossCountByTechniqueDto>;

export class GetStatisticResponse {
  matchCount: number;
  winRate: WinRateStatisticsResponse;
  lossCount: LossCountStatisticsResponse;
}