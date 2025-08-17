export class UpdateCounterQuery {
  type: 'attack_attempt_count' | 'parry_attempt_count' | 'counter_attack_attempt_count';
  delta: number;
}