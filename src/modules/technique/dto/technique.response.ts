import { TechniqueType } from '@prisma/client';

export class TechniqueResponse {
  id: number;
  name: string;
  type: TechniqueType;
  children?: TechniqueResponse[]
}