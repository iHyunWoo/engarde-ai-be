import { IsString } from 'class-validator';

export class GetSignedUrlQuery {
  @IsString()
  object!: string;
}