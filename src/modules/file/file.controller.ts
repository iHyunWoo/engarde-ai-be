import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FileService } from '@/modules/file/file.service';
import { PostSignedUrlRequestDto } from '@/modules/file/dto/post-signed-url.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('write-signed-url')
  async getWriteSignedUrl(@Body() dto: PostSignedUrlRequestDto) {
    const result = await this.fileService.issueWriteSignedUrl(dto.fileName, dto.contentType);
    return new BaseResponse(200, '발급 성공', result);
  }

  @Get('read-signed-url')
  async getReadSignedUrl(@Query('object') objectName: string) {
    const result = await this.fileService.issueReadSignedUrl(objectName);
    return new BaseResponse(200, '발급 성공', result);
  }
}