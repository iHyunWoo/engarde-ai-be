import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Res, Patch, BadRequestException, HttpCode,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequest } from './dto/create-match.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';
import { GetMatchListRequest } from '@/modules/match/dto/get-match-list.request';
import { AppError } from '@/shared/error/app-error';

@Authenticated()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @HttpCode(201)
  async create(
    @User() user: JwtPayload,
    @Body() dto: CreateMatchRequest,
  ) {
    const result = await this.matchService.create(user.userId, dto);
    return new BaseResponse(201, '생성 성공', result);
  }

  @Get()
  async findManyWithPagination(
    @User() user: JwtPayload,
    @Query() query: GetMatchListRequest,
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

  @Get(':id')
  async findOne(
    @User() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.matchService.findOne(user.userId, id);
    return new BaseResponse(200, '조회 성공', result)
  }

  @Delete(':id')
  delete(
    @User() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number
  ) {
    const result = this.matchService.delete(user.userId, id);
    return new BaseResponse(200, '삭제 성공', result)
  }

  @Patch(':id/counter')
  async updateCounter(
    @User() user: JwtPayload,
    @Param('id', ParseIntPipe) matchId: number,
    @Query('type') type: 'attack_attempt_count' | 'parry_attempt_count' | 'counter_attack_attempt_count',
    @Query('delta', ParseIntPipe) delta: number,
  ) {
    if (!['attack_attempt_count', 'parry_attempt_count', 'counter_attack_attempt_count'].includes(type)) {
      throw new AppError('MATCH_INVALID_COUNTER_TYPE');
    }

    const result = await this.matchService.updateCounter(user.userId, matchId, type, delta);
    return new BaseResponse(200, '변경 성공', result)
  }

}
