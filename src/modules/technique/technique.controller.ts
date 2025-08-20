import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller, HttpCode } from '@nestjs/common';
import { TechniqueService } from '@/modules/technique/technique.service';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { GetSuggestTechniqueQuery } from '@/modules/technique/dto/get-suggest-technique.query';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';
import { UpsertTechniqueRequest } from '@/modules/technique/dto/upsert-technique.request';
import { CursorQuery } from '@/shared/dto/cursor.query';

@Authenticated()
@Controller('techniques')
export class TechniqueController {
  constructor(private readonly techniqueService: TechniqueService) {
  }

  @TypedRoute.Get('suggest')
  async suggest(
    @User() user: JwtPayload,
    @TypedQuery() query: GetSuggestTechniqueQuery
  ): Promise<BaseResponse<TechniqueResponse[]>> {
    const result = await this.techniqueService.suggest(user.userId, query.query)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Get()
  async findAllByPagination(
    @User() user: JwtPayload,
    @TypedQuery() query: CursorQuery
  ): Promise<BaseResponse<CursorResponse<TechniqueResponse>>> {
    const { limit, cursor } = query
    const result = await this.techniqueService.findAllByPagination(user.userId, limit, cursor)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Get('/all')
  async findAll(
    @User() user: JwtPayload
  ): Promise<BaseResponse<TechniqueResponse[]>> {
    const result = await this.techniqueService.findAll(user.userId)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Put(':id')
  async update(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() body: UpsertTechniqueRequest
  ): Promise<BaseResponse<TechniqueResponse>> {
    const result = await this.techniqueService.update(user.userId, id, body)
    return new BaseResponse(200, '수정 성공', result)
  }

  @TypedRoute.Delete(':id')
  async delete(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
  ): Promise<BaseResponse<TechniqueResponse>> {
    const result = await this.techniqueService.delete(user.userId, id)
    return new BaseResponse(200, '삭제 성공', result)
  }

  @TypedRoute.Post()
  @HttpCode(201)
  async create(
    @User() user: JwtPayload,
    @TypedBody() body: UpsertTechniqueRequest
  ): Promise<BaseResponse<TechniqueResponse>> {
    const result = await this.techniqueService.create(user.userId, body)
    return new BaseResponse(201, '생성 성공', result)
  }
}