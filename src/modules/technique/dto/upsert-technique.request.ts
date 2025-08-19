import { TechniqueType } from '@prisma/client';

export class UpsertTechniqueRequest {
  name: string;
  type: TechniqueType;
  parentId?: number | undefined;
}