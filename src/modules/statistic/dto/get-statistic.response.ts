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
  topNotes: TopNoteDto[];
}

class LoseDto {
  lungeLoseCount: number;
  advancedLungeLoseCount: number;
  flecheLoseCount: number;
  pushLoseCount: number;
  parryLoseCount: number;
  counterAttackLoseCount: number;
  topNotes: TopNoteDto[];
}

export class GetStatisticResponse {
  attempt?: AttemptDto;
  lose?: LoseDto;
}