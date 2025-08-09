import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { MarkingsService } from '@/modules/marking/marking.service';
import { CreateMarkingRequest } from '@/modules/marking/dto/create-marking.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';

@Authenticated()
@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) {}

  @Post()
  async create(
    @User() user: JwtPayload,
    @Body() dto: CreateMarkingRequest,
    @Res() res: Response
  ) {
    const result = await this.markingsService.create(user.userId, dto);
    const response = new BaseResponse(201, '생성 성공', result);
    return res.status(201).json(response);
  }

  @Get()
  async list(@Query('matchId') matchId: string, @Res() res: Response) {
    const result = await this.markingsService.listByMatch(Number(matchId));
    const response = new BaseResponse(200, '조회 성공', result);
    return res.status(201).json(response);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const result = await this.markingsService.remove(Number(id));
    const response = new BaseResponse(200, '삭제 성공', result);
    return res.status(201).json(response);
  }
}
