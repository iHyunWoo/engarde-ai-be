import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertOpponentRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  team: string;
}