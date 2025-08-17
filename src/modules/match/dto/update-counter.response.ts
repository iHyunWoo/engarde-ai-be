export class UpdateCounterResponse {
  id: number;
  attackAttemptCount: number;
  parryAttemptCount: number;
  counterAttackAttemptCount: number;
  updatedAt!: Date;
}