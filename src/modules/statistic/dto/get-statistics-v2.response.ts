import {
  LossCountStatisticsResponse,
  OpponentStat,
  TechniqueStat,
  WinRateStatisticsResponse,
} from '@/modules/statistic/dto/get-statistic.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';

export interface GetStatisticV2Response {
  matchCount: number;
  summary: StatisticSummary;
  techniquesByMatch: TechniquesByMatch[];
  opponentStats: OpponentStat[]
  winRate: WinRateStatisticsResponse;
  lossCount: LossCountStatisticsResponse;
}

export interface StatisticSummary {
  win: TechniqueStat[]
  lose: TechniqueStat[]
}

export interface TechniquesByMatch {
  match: GetMatchListResponse;
  summary: StatisticSummary;
}