import {
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamRequest } from './dto/create-team.request';
import { GenerateInviteCodeRequest } from './dto/generate-invite-code.request';
import { GetAllTeamsRequest } from './dto/get-all-teams.request';
import { GetTeamStudentsQuery } from './dto/get-team-students.query';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import { RequireRoles } from '@/shared/decorators/roles.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { UseGuards } from '@nestjs/common';

@Authenticated()
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @TypedRoute.Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async create(
    @User() user: JwtPayload,
    @TypedBody() dto: CreateTeamRequest,
  ) {
    const result = await this.teamService.create(user.userId, dto);
    return new BaseResponse(HttpStatus.CREATED, '팀 생성 성공', result);
  }

  @TypedRoute.Delete(':teamId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async delete(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
  ) {
    const result = await this.teamService.delete(Number(teamId), user.userId);
    return new BaseResponse(HttpStatus.OK, '팀 삭제 성공', result);
  }

  @TypedRoute.Get('my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN', 'COACH')
  async getMyTeam(@User() user: JwtPayload) {
    const result = await this.teamService.getMyTeam(user.userId);
    return new BaseResponse(HttpStatus.OK, '내 팀 조회 성공', result);
  }

  @TypedRoute.Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getAllTeams(
    @User() user: JwtPayload,
    @TypedQuery() query: GetAllTeamsRequest,
  ) {
    const { limit, cursor, q } = query;
    const result = await this.teamService.getAllTeams(
      user.userId,
      limit,
      cursor ? Number(cursor) : undefined,
      q,
    );
    return new BaseResponse(HttpStatus.OK, '모든 팀 조회 성공', result);
  }

  @TypedRoute.Get(':teamId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getTeamById(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
  ) {
    const result = await this.teamService.getTeamById(Number(teamId), user.userId);
    return new BaseResponse(HttpStatus.OK, '팀 조회 성공', result);
  }

  @TypedRoute.Get(':teamId/members')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN', 'COACH')
  async getTeamMembers(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
  ) {
    const result = await this.teamService.getTeamMembers(
      Number(teamId),
      user.userId,
    );
    return new BaseResponse(HttpStatus.OK, '팀 멤버 조회 성공', result);
  }

  @TypedRoute.Delete(':teamId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN', 'COACH')
  async removeMember(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
    @TypedParam('memberId') memberId: string,
  ) {
    const result = await this.teamService.removeMember(
      Number(teamId),
      Number(memberId),
      user.userId,
    );
    return new BaseResponse(HttpStatus.OK, '멤버 제거 성공', result);
  }

  @TypedRoute.Post(':teamId/invite-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN', 'COACH')
  async generateInviteCode(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
    @TypedBody() dto: GenerateInviteCodeRequest,
  ) {
    const result = await this.teamService.generateInviteCode(
      Number(teamId),
      user.userId,
      dto.expiresAt,
    );
    return new BaseResponse(HttpStatus.OK, '초대코드 생성 성공', result);
  }

  @TypedRoute.Get('my/students')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('COACH')
  async getTeamStudents(
    @User() user: JwtPayload,
    @TypedQuery() query: GetTeamStudentsQuery,
  ) {
    const { limit, cursor, q } = query;
    const result = await this.teamService.getTeamStudents(
      user.userId,
      limit,
      cursor ? Number(cursor) : undefined,
      q,
    );
    return new BaseResponse(HttpStatus.OK, '학생 목록 조회 성공', result);
  }
}
