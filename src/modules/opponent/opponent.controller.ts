import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller, HttpCode } from '@nestjs/common';
import { OpponentService } from '@/modules/opponent/opponent.service';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { GetSuggestOpponentQuery } from '@/modules/opponent/dto/get-suggest-opponent.query';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { OpponentResponse } from '@/modules/opponent/dto/opponent.response';
import { GetOpponentListQuery } from '@/modules/opponent/dto/get-opponent-list.query';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { UpsertOpponentRequest } from '@/modules/opponent/dto/upsert-opponent.request';

@Authenticated()
@Controller('opponents')
export class OpponentController {
  constructor(private readonly opponentService: OpponentService) {
  }

  @TypedRoute.Get('suggest')
  async suggest(
    @User() user: JwtPayload,
    @TypedQuery() query: GetSuggestOpponentQuery
  ): Promise<BaseResponse<OpponentResponse[]>> {
    const result = await this.opponentService.suggest(user.userId, query.query)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Get()
  async findAllByPagination(
    @User() user: JwtPayload,
    @TypedQuery() query: GetOpponentListQuery
  ): Promise<BaseResponse<CursorResponse<OpponentResponse>>> {
    const { limit, cursor } = query
    const result = await this.opponentService.findAllByPagination(user.userId, limit, cursor)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Put(':id')
  async update(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() body: UpsertOpponentRequest
  ): Promise<BaseResponse<OpponentResponse>> {
    const result = await this.opponentService.update(user.userId, id, body)
    return new BaseResponse(200, '수정 성공', result)
  }

  @TypedRoute.Delete(':id')
  async delete(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
  ): Promise<BaseResponse<OpponentResponse>> {
    const result = await this.opponentService.delete(user.userId, id)
    return new BaseResponse(200, '삭제 성공', result)
  }

  @TypedRoute.Post()
  @HttpCode(201)
  async create(
    @User() user: JwtPayload,
    @TypedBody() body: UpsertOpponentRequest
  ): Promise<BaseResponse<OpponentResponse>> {
    const result = await this.opponentService.create(user.userId, body)
    return new BaseResponse(201, '생성 성공', result)
  }
}