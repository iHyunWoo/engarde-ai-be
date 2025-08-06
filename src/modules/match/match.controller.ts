import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
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

  @Post()
  create(@User() user: JwtPayload, @Body() dto: CreateMatchRequestDto, @Res() res: Response) {
    const result = this.matchService.create(user.userId, dto);
    const response = new BaseResponse(201, '생성 성공', result)
    return res.status(201).json(response)
  }

  @Get()
  findManyWithPagination(
    @User() user: JwtPayload,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string
  ) {

    return this.matchService.findManyWithPagination(user.userId, limit, cursor ? Number(cursor) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.delete(id);
  }
}