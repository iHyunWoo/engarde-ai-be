export interface TacticScoreStat {
  id: number;
  name: string;
  count: number;
  isMain: boolean;
  parentId?: number | null;
}

export interface TacticMatchup {
  myTacticId: number;
  opponentTacticId: number;
  winCount: number;
  loseCount: number;
  winRate: number; // 0-100
}

export interface TacticMatchupDetail {
  myTactic: {
    id: number;
    name: string;
    isMain: boolean;
    parentId?: number | null;
  };
  opponentTactic: {
    id: number;
    name: string;
    isMain: boolean;
    parentId?: number | null;
  };
  winCount: number;
  loseCount: number;
  winRate: number;
  // Sub tactics 상성 (Main을 클릭했을 때 보여줄 상세 정보)
  subMatchups?: TacticMatchupDetail[];
}

export interface GetStatisticV3Response {
  // 득점한 횟수 높은 tactic (전체)
  topScoringTactics: TacticScoreStat[];
  // 득점을 제일 많이 당한 tactic (전체)
  topConcededTactics: TacticScoreStat[];
  // tactic 상성 (Main vs Main, 클릭하면 Sub 상세 정보)
  tacticMatchups: TacticMatchupDetail[];
}
