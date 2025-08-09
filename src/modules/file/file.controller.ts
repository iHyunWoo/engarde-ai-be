import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { FileService } from '@/modules/file/file.service';
import { PostSignedUrlRequestDto } from '@/modules/file/dto/post-signed-url.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('write-signed-url')
  async getWriteSignedUrl(@Body() dto: PostSignedUrlRequestDto, @Res() res: Response) {
    const result = await this.fileService.issueWriteSignedUrl(dto.fileName, dto.contentType);
    const response = new BaseResponse(200, '발급 성공', result);
    return res.status(200).json(response);
  }

  @Get('read-signed-url')
  async getReadSignedUrl(@Query('object') objectName: string, @Res() res: Response) {
    const result = await this.fileService.issueReadSignedUrl(objectName);
    const response = new BaseResponse(200, '발급 성공', result);
    return res.status(200).json(response);
  }
}