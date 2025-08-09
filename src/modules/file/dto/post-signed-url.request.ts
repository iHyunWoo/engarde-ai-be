import { IsNotEmpty, IsString } from 'class-validator';

export class PostSignedUrlRequestDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}