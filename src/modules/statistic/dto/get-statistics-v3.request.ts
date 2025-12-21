import { tags } from 'typia';
import { MatchStage } from '@prisma/client';

export type StatisticMode = MatchStage | 'all'

export interface GetStatisticV3Request {
  from: string & tags.Format<'date'>;
  to: string & tags.Format<'date'>;
  mode: StatisticMode;
}