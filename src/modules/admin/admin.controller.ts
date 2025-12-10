import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { GenerateAdminInviteCodeRequest } from './dto/generate-admin-invite-code.request';
import { GetOrphanedUsersQuery } from './dto/get-orphaned-users.query';
import { GetAllUsersQuery } from './dto/get-all-users.query';
import { AssignCoachRequest } from './dto/assign-coach.request';
import { CreateCoachRequest } from './dto/create-coach.request';
import { UpdateTeamMaxMembersRequest } from './dto/update-team-max-members.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import { RequireRoles } from '@/shared/decorators/roles.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';

@Authenticated()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @TypedRoute.Get('invite-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getAdminInviteCode(@User() user: JwtPayload) {
    const result = await this.adminService.getAdminInviteCode(user.userId);
    return new BaseResponse(HttpStatus.OK, 'Admin 초대코드 조회 성공', result);
  }

  @TypedRoute.Post('invite-code')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async generateAdminInviteCode(
    @User() user: JwtPayload,
    @TypedBody() dto: GenerateAdminInviteCodeRequest,
  ) {
    const result = await this.adminService.generateAdminInviteCode(user.userId, dto);
    return new BaseResponse(HttpStatus.CREATED, 'Admin 초대코드 생성 성공', result);
  }

  @TypedRoute.Get('orphaned-users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getOrphanedUsers(
    @User() user: JwtPayload,
    @TypedQuery() query: GetOrphanedUsersQuery,
  ) {
    const result = await this.adminService.getOrphanedUsers(user.userId, query.cursor);
    return new BaseResponse(HttpStatus.OK, '무소속 유저 목록 조회 성공', result);
  }

  @TypedRoute.Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async softDeleteUser(
    @User() user: JwtPayload,
    @TypedParam('userId') userId: string,
  ) {
    const result = await this.adminService.softDeleteUser(user.userId, Number(userId));
    return new BaseResponse(HttpStatus.OK, '유저 탈퇴 처리 성공', result);
  }

  @TypedRoute.Get('deleted-users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getDeletedUsers(
    @User() user: JwtPayload,
    @TypedQuery() query: GetOrphanedUsersQuery,
  ) {
    const result = await this.adminService.getDeletedUsers(user.userId, query.cursor);
    return new BaseResponse(HttpStatus.OK, '탈퇴 유저 목록 조회 성공', result);
  }

  @TypedRoute.Patch('users/:userId/restore')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async restoreUser(
    @User() user: JwtPayload,
    @TypedParam('userId') userId: string,
  ) {
    const result = await this.adminService.restoreUser(user.userId, Number(userId));
    return new BaseResponse(HttpStatus.OK, '유저 복구 성공', result);
  }

  @TypedRoute.Get('users')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async getAllUsers(
    @User() user: JwtPayload,
    @TypedQuery() query: GetAllUsersQuery,
  ) {
    const { limit, cursor, q } = query;
    const result = await this.adminService.getAllUsers(
      user.userId,
      limit,
      cursor ? Number(cursor) : undefined,
      q,
    );
    return new BaseResponse(HttpStatus.OK, '전체 유저 목록 조회 성공', result);
  }

  @TypedRoute.Post('teams/:teamId/coach')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async assignCoachToTeam(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
    @TypedBody() dto: AssignCoachRequest,
  ) {
    const result = await this.adminService.assignCoachToTeam(
      user.userId,
      Number(teamId),
      dto.userId,
    );
    return new BaseResponse(HttpStatus.OK, '코치 등록 성공', result);
  }

  @TypedRoute.Post('coaches')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async createCoach(
    @User() user: JwtPayload,
    @TypedBody() dto: CreateCoachRequest,
  ) {
    const result = await this.adminService.createCoach(user.userId, dto);
    return new BaseResponse(HttpStatus.CREATED, '코치 계정 생성 성공', result);
  }

  @TypedRoute.Delete('teams/:teamId/coach')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async removeCoachFromTeam(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
  ) {
    const result = await this.adminService.removeCoachFromTeam(
      user.userId,
      Number(teamId),
    );
    return new BaseResponse(HttpStatus.OK, '코치 등록 해제 성공', result);
  }

  @TypedRoute.Patch('teams/:teamId/max-members')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @RequireRoles('ADMIN')
  async updateTeamMaxMembers(
    @User() user: JwtPayload,
    @TypedParam('teamId') teamId: string,
    @TypedBody() dto: UpdateTeamMaxMembersRequest,
  ) {
    const result = await this.adminService.updateTeamMaxMembers(
      user.userId,
      Number(teamId),
      dto,
    );
    return new BaseResponse(HttpStatus.OK, '팀 최대 인원수 설정 성공', result);
  }
}

