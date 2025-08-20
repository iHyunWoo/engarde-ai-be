import { IsString } from 'class-validator';

export class GetSuggestOpponentQuery {
  @IsString()
  query: string;
}