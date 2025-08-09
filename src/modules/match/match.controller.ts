import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Res, Patch, BadRequestException,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequestDto } from './dto/create-match.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';

@Authenticated()
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post() async create(
    @User() user: JwtPayload,
    @Body() dto: CreateMatchRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.matchService.create(user.userId, dto);
    const response = new BaseResponse(201, '생성 성공', result);
    return res.status(201).json(response);
  }

  @Get() async findManyWithPagination(
    @User() user: JwtPayload,
    @Res() res: Response,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.matchService.findManyWithPagination(
      user.userId,
      limit,
      cursor ? Number(cursor) : undefined,
    );
    const response = new BaseResponse(200, '조회 성공', result);
    return res.status(200).json(response);
  }

  @Get(':id')
  async findOne(
    @User() user: JwtPayload,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.matchService.findOne(user.userId, id);
    const response = new BaseResponse(200, '조회 성공', result)
    return res.status(200).json(response)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.delete(id);
  }

  @Patch(':id/counter')
  async updateCounter(
    @Param('id', ParseIntPipe) matchId: number,
    @Query('type') type: 'attack_attempt_count' | 'parry_attempt_count' | 'counter_attack_attempt_count',
    @Query('delta', ParseIntPipe) delta: number,
    @Res() res: Response,
  ) {
    if (!['attack_attempt_count', 'parry_attempt_count', 'counter_attack_attempt_count'].includes(type)) {
      throw new BadRequestException('Invalid counter type');
    }

    const result = await this.matchService.updateCounter(matchId, type, delta);
    const response = new BaseResponse(200, '변경 성공', result)
    return res.status(200).json(response)
  }

}
