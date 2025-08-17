import { IsString } from 'class-validator';

export class GetSuggestQuery {
  @IsString()
  query: string;
}