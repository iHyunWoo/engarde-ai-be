import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CoachService } from './coach.service';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { RequireRoles } from '@/shared/decorators/roles.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { GetMatchListRequest } from '@/modules/match/dto/get-match-list.request';
import { UpdateMatchFeedbackRequest } from '@/modules/match/dto/update-match-feedback.request';
import { UpdateMarkingCoachNoteRequest } from '@/modules/marking/dto/update-marking-coach-note.request';

@Authenticated()
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @TypedRoute.Get('users/:userId/matches')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('COACH')
  async findMatchesByUserId(
    @User() user: JwtPayload,
    @TypedParam('userId') userId: string,
    @TypedQuery() query: GetMatchListRequest,
  ) {
    const { limit, cursor, from, to } = query;
    const result = await this.coachService.findMatchesByUserId(
      user.userId,
      Number(userId),
      limit,
      cursor ? Number(cursor) : undefined,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return new BaseResponse(HttpStatus.OK, '유저 경기 목록 조회 성공', result);
  }

  @TypedRoute.Get('users/:userId/matches/:matchId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('COACH')
  async findMatchById(
    @User() user: JwtPayload,
    @TypedParam('userId') userId: string,
    @TypedParam('matchId') matchId: string,
  ) {
    const result = await this.coachService.findMatchById(
      user.userId,
      Number(matchId),
    );
    return new BaseResponse(HttpStatus.OK, '경기 상세 조회 성공', result);
  }

  @TypedRoute.Patch('matches/:matchId/feedback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('COACH')
  async updateMatchFeedback(
    @User() user: JwtPayload,
    @TypedParam('matchId') matchId: string,
    @TypedBody() dto: UpdateMatchFeedbackRequest,
  ) {
    const result = await this.coachService.updateMatchFeedback(
      user.userId,
      Number(matchId),
      dto.coachFeedback || '',
    );
    return new BaseResponse(HttpStatus.OK, '경기 피드백 작성 성공', result);
  }

  @TypedRoute.Patch('markings/:markingId/note')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('COACH')
  async updateMarkingCoachNote(
    @User() user: JwtPayload,
    @TypedParam('markingId') markingId: string,
    @TypedBody() dto: UpdateMarkingCoachNoteRequest,
  ) {
    const result = await this.coachService.updateMarkingCoachNote(
      user.userId,
      Number(markingId),
      dto.coachNote || '',
    );
    return new BaseResponse(HttpStatus.OK, '마킹 노트 작성 성공', result);
  }
}

