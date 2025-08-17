import { IsOptional, IsString } from 'class-validator';

export class RefreshHeaders {
  @IsOptional()
  @IsString()
  cookie?: string;
}