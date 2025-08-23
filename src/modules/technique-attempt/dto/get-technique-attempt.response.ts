import { Technique } from '@prisma/client';

export class GetTechniqueAttemptResponse {
  id: number;
  technique: Omit<Technique, 'children'>;
  attemptCount: number;
}