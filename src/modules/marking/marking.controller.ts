import {
  Controller,
  HttpCode,
} from '@nestjs/common';
import { MarkingsService } from '@/modules/marking/marking.service';
import { CreateMarkingRequest } from '@/modules/marking/dto/create-marking.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { GetMarkingListQuery } from '@/modules/marking/dto/get-marking-list.query';

@Authenticated()
@Controller('markings')
export class MarkingsController {
  constructor(private readonly markingsService: MarkingsService) {}

  @TypedRoute.Post()
  @HttpCode(201)
  async create(
    @User() user: JwtPayload,
    @TypedBody() dto: CreateMarkingRequest,
  ) {
    const result = await this.markingsService.create(user.userId, dto);
    return new BaseResponse(201, '생성 성공', result);
  }

  @TypedRoute.Get()
  async list(
    @TypedQuery() query: GetMarkingListQuery
  ) {
    const result = await this.markingsService.listByMatch(query.matchId);
    return new BaseResponse(200, '조회 성공', result);
  }

  @TypedRoute.Delete(':id')
  async remove(@TypedParam('id') id: string) {
    const result = await this.markingsService.remove(Number(id));
    return new BaseResponse(200, '삭제 성공', result);
  }
}
