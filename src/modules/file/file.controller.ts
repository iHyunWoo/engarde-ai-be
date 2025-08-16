import { Controller } from '@nestjs/common';
import { FileService } from '@/modules/file/file.service';
import { PostSignedUrlRequestDto } from '@/modules/file/dto/post-signed-url.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TypedBody, TypedQuery, TypedRoute } from '@nestia/core';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { GetSignedUrlQuery } from '@/modules/file/dto/get-signed-url.query';

@Authenticated()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @TypedRoute.Post('write-signed-url')
  async getWriteSignedUrl(@TypedBody() dto: PostSignedUrlRequestDto) {
    const result = await this.fileService.issueWriteSignedUrl(dto.fileName, dto.contentType);
    return new BaseResponse(200, '발급 성공', result);
  }

  @TypedRoute.Get('read-signed-url')
  async getReadSignedUrl(
    @TypedQuery() query: GetSignedUrlQuery
  ) {
    const result = await this.fileService.issueReadSignedUrl(query.object);
    return new BaseResponse(200, '발급 성공', result);
  }
}