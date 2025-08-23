import { Technique, TechniqueAttempt } from '@prisma/client';
import { GetTechniqueAttemptResponse } from '@/modules/technique-attempt/dto/get-technique-attempt.response';

export const mapToGetTechniqueAttemptRes = (input: TechniqueAttemptMapperInput): GetTechniqueAttemptResponse => {
  return {
    id: input.id,
    technique: input.technique,
    attemptCount: input.attempt_count
  }
}

interface TechniqueAttemptMapperInput extends Omit<TechniqueAttempt, 'technique_id'>{
  technique: Omit<Technique, 'children'>
}