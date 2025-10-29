import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AppError } from '@/shared/error/app-error';
import { CreateTeamRequest } from './dto/create-team.request';
import { mapToTeamListResponse, mapToTeamListResponseList } from '@/modules/team/mapper/team-list.mapper';
import { mapToTeamDetailResponse } from '@/modules/team/mapper/team-detail.mapper';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { TeamListResponse } from './dto/team-list.response';
import { TeamDetailResponse } from './dto/team-detail.response';
import { Prisma } from '@prisma/client';
import { UserResponse } from '@/modules/user/dto/user.response';
import { mapToUserResponse } from '@/modules/user/mapper/user.mapper';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}


  async create(userId: number, dto: CreateTeamRequest): Promise<TeamListResponse> {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const created = await this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        inviteCode: null,
        inviteCodeExpiresAt: null,
      },
      include: {
        coach: true,
      },
    });

    // 멤버 수 카운트
    const memberCount = await this.prisma.user.count({
      where: {
        teamId: created.id,
        deletedAt: null,
      },
    });

    return mapToTeamListResponse({
      ...created,
      memberCount,
    });
  }

  async delete(teamId: number, userId: number) {
    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 팀 삭제 (소프트 삭제)
    await this.prisma.team.update({
      where: { id: teamId },
      data: { deletedAt: new Date() },
    });

    // 팀 멤버들을 무소속으로 변경
    await this.prisma.user.updateMany({
      where: { teamId: teamId },
      data: { teamId: null },
    });

    return { success: true };
  }


  async getTeamMembers(teamId: number, userId: number) {
    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { coach: true, members: true },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 사용자 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // ADMIN이거나 해당 팀의 코치만 접근 가능
    const isAdmin = user.role === 'ADMIN';
    const isCoach = team.coachId !== null && team.coachId === userId;

    if (!isAdmin && !isCoach) {
      throw new AppError('UNAUTHORIZED');
    }

    return team.members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  }

  async removeMember(teamId: number, memberId: number, userId: number) {
    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 사용자 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // ADMIN이거나 해당 팀의 코치만 멤버 제거 가능
    const isAdmin = user.role === 'ADMIN';
    const isCoach = team.coachId !== null && team.coachId === userId;

    if (!isAdmin && !isCoach) {
      throw new AppError('UNAUTHORIZED');
    }

    // 멤버를 무소속으로 변경
    await this.prisma.user.update({
      where: { id: memberId },
      data: { teamId: null },
    });

    return { success: true };
  }


  async getMyTeam(userId: number): Promise<TeamDetailResponse | null> {
    // 사용자 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // ADMIN 또는 COACH만 접근 가능
    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      throw new AppError('UNAUTHORIZED');
    }

    const userWithTeam = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            coach: true,
            members: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        coachedTeam: {
          include: {
            coach: true,
            members: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (userWithTeam?.team) {
      return mapToTeamDetailResponse({
        ...userWithTeam.team,
        members: userWithTeam.team.members,
      });
    }

    if (userWithTeam?.coachedTeam) {
      return mapToTeamDetailResponse({
        ...userWithTeam.coachedTeam,
        members: userWithTeam.coachedTeam.members,
      });
    }

    return null;
  }

  async getAllTeams(
    userId: number,
    limit: number = 10,
    cursor?: number,
    searchKeyword?: string,
  ): Promise<CursorResponse<TeamListResponse>> {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const take = limit ?? 10;
    
    // 검색 조건 추가
    const where: Prisma.TeamWhereInput = {
      deletedAt: null,
    };

    if (searchKeyword) {
      where.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const teams = await this.prisma.team.findMany({
      where,
      include: {
        coach: true,
      },
      orderBy: { id: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = teams.length > take;
    const trimmed = hasNextPage ? teams.slice(0, -1) : teams;

    // 각 팀의 멤버 수 조회
    const teamsWithCount = await Promise.all(
      trimmed.map(async (team) => {
        const memberCount = await this.prisma.user.count({
          where: {
            teamId: team.id,
            deletedAt: null,
          },
        });
        return {
          ...team,
          memberCount,
        };
      }),
    );

    return {
      items: mapToTeamListResponseList(teamsWithCount),
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async getTeamById(teamId: number, userId: number): Promise<TeamDetailResponse> {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        coach: true,
        members: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    return mapToTeamDetailResponse({
      ...team,
      members: team.members,
    });
  }

  async generateInviteCode(teamId: number, userId: number, expiresAt?: string) {
    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 사용자 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // ADMIN이거나 해당 팀의 코치만 초대코드 생성 가능
    const isAdmin = user.role === 'ADMIN';
    const isCoach = team.coachId !== null && team.coachId === userId;

    if (!isAdmin && !isCoach) {
      throw new AppError('UNAUTHORIZED');
    }

    // 새로운 초대코드 생성
    const newInviteCode = this.generateRandomCode();
    
    await this.prisma.team.update({
      where: { id: teamId },
      data: { 
        inviteCode: newInviteCode,
        inviteCodeExpiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return { inviteCode: newInviteCode };
  }

  async getTeamStudents(
    userId: number,
    limit: number = 10,
    cursor?: number,
    searchKeyword?: string,
  ): Promise<CursorResponse<UserResponse>> {
    // 사용자 권한 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }

    // COACH 권한 확인
    if (user.role !== 'COACH') {
      throw new AppError('UNAUTHORIZED');
    }

    // 코치가 관리하는 팀 확인
    const team = await this.prisma.team.findUnique({
      where: { coachId: userId },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    const take = limit ?? 10;

    // 검색 조건 추가
    const where: Prisma.UserWhereInput = {
      teamId: team.id,
      deletedAt: null,
      role: 'PLAYER', // 학생만 조회
      ...(searchKeyword && {
        OR: [
          { name: { contains: searchKeyword, mode: 'insensitive' } },
          { email: { contains: searchKeyword, mode: 'insensitive' } },
        ],
      }),
    };

    const students = await this.prisma.user.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { id: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = students.length > take;
    const trimmed = hasNextPage ? students.slice(0, -1) : students;

    return {
      items: trimmed.map(mapToUserResponse),
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
