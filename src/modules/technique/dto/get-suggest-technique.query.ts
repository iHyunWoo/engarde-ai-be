import { IsString } from 'class-validator';

export class GetSuggestTechniqueQuery {
  @IsString()
  query: string;
}