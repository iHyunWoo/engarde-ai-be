class TopNoteDto {
  note: string;
  count: number;
}

class AttemptDto {
  attackAttemptCount: number;
  parryAttemptCount: number;
  counterAttackAttemptCount: number;
  attackWinCount: number;
  parryWinCount: number;
  counterAttackWinCount: number;
  topNotesByType?: {
    attack: TopNoteDto[];
    parry: TopNoteDto[];
    counterAttack: TopNoteDto[];
  };
}

class LoseDto {
  lungeLoseCount: number;
  advancedLungeLoseCount: number;
  flecheLoseCount: number;
  pushLoseCount: number;
  parryLoseCount: number;
  counterAttackLoseCount: number;
  topNotesByType?: {
    lunge: TopNoteDto[];
    advancedLunge: TopNoteDto[];
    fleche: TopNoteDto[];
    push: TopNoteDto[];
    parry: TopNoteDto[];
    counter: TopNoteDto[];
  }
}

export class GetStatisticResponse {
  attempt?: AttemptDto;
  lose?: LoseDto;
}