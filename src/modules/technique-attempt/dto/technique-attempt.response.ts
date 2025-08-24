export class TechniqueAttemptResponse {
  id: number;
  technique: {
    id: number;
    name: string;
  }
  attemptCount: number;
}