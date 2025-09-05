import {
  Controller, HttpCode,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequest } from './dto/create-match.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { GetMatchListRequest } from '@/modules/match/dto/get-match-list.request';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { GetMatchByOpponentQuery } from '@/modules/match/dto/get-match-by-opponent.query';
import type { VideoMergeRequest } from '@/modules/match/dto/video-merge.request';
import { FileService } from '@/modules/file/file.service';
import { PostSignedUrlRequestDto } from '@/modules/file/dto/post-signed-url.request';

@Authenticated()
@Controller('matches')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly fileService: FileService,
  ) {}

  @TypedRoute.Get('opponent')
  async getMatchByOpponent(
    @User() user: JwtPayload,
    @TypedQuery() query: GetMatchByOpponentQuery,
  ) {
    const result = await this.matchService.findAllByOpponent(user.userId, query.opponentId)
    return new BaseResponse(200, '조회 성공', result)
  }

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

  @TypedRoute.Post(':id/videos/upload')
  async postWriteSignedUrl(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() dto: PostSignedUrlRequestDto[],
  ) {
    const result = await this.fileService.issueWriteSignedUrlsByMatch(id, dto)
    return new BaseResponse(200, '발급 성공', result)
  }

  @TypedRoute.Post(':id/videos')
  async requestVideoMerge(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() dto: VideoMergeRequest,
  ) {
    await this.matchService.requestVideoMerge(user.userId, id, dto.objectNames)
    return new BaseResponse(200, '요청 성공')
  }
}
