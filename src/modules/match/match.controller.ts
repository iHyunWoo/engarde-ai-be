import {
  Controller,
  Param,
  ParseIntPipe,
  Query,
  Patch, HttpCode,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequest } from './dto/create-match.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { GetMatchListRequest } from '@/modules/match/dto/get-match-list.request';
import { AppError } from '@/shared/error/app-error';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';

@Authenticated()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @TypedRoute.Post()
  @HttpCode(201)
  async create(
    @User() user: JwtPayload,
    @TypedBody() dto: CreateMatchRequest,
  ) {
    const result = await this.matchService.create(user.userId, dto);
    return new BaseResponse(201, '생성 성공', result);
  }

  @TypedRoute.Get()
  async findManyWithPagination(
    @User() user: JwtPayload,
    @TypedQuery() query: GetMatchListRequest,
  ) {
    const { limit, cursor, from, to } = query;
    const result = await this.matchService.findManyWithPagination(
      user.userId,
      limit,
      cursor ? Number(cursor) : undefined,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return new BaseResponse(200, '조회 성공', result);
  }

  @TypedRoute.Get(':id')
  async findOne(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
  ) {
    const result = await this.matchService.findOne(user.userId, id);
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Put(':id') async update(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() dto: CreateMatchRequest,
  )  {
    const result = await this.matchService.update(user.userId, id, dto);
    return new BaseResponse(200, '수정 성공', result);
  }

  @TypedRoute.Delete(':id') async delete(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
  ) {
    await this.matchService.delete(user.userId, id);
    return  new BaseResponse(200, '삭제 성공');
  }

  @TypedRoute.Patch(':id/counter')
  async updateCounter(
    @User() user: JwtPayload,
    @TypedParam('id') matchId: number,
    @TypedQuery() type: 'attack_attempt_count' | 'parry_attempt_count' | 'counter_attack_attempt_count',
    @Query('delta', ParseIntPipe) delta: number,
  ) {
    if (!['attack_attempt_count', 'parry_attempt_count', 'counter_attack_attempt_count'].includes(type)) {
      throw new AppError('MATCH_INVALID_COUNTER_TYPE');
    }

    const result = await this.matchService.updateCounter(user.userId, matchId, type, delta);
    return new BaseResponse(200, '변경 성공', result)
  }

}
