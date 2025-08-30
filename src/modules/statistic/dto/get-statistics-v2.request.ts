import { tags } from 'typia';
import { MatchStage } from '@prisma/client';

export type StatisticMode = MatchStage | 'all'

export interface GetStatisticsV2Request {
  from: string & tags.Format<'date'>;
  to: string & tags.Format<'date'>;
  mode: StatisticMode;
}