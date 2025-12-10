import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { AppError } from '@/shared/error/app-error';
import { GenerateAdminInviteCodeRequest } from './dto/generate-admin-invite-code.request';
import { CursorResponse } from '@/shared/dto/cursor-response';
import { UserResponse } from '@/modules/user/dto/user.response';
import { mapToUserResponse } from '@/modules/user/mapper/user.mapper';
import { Prisma } from '@prisma/client';
import { CreateCoachRequest } from './dto/create-coach.request';
import { TechniqueService } from '@/modules/technique/technique.service';
import { AuthService } from '@/modules/auth/auth.service';
import { UpdateTeamMaxMembersRequest } from './dto/update-team-max-members.request';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly techniqueService: TechniqueService,
    private readonly authService: AuthService,
  ) {}

  async generateAdminInviteCode(userId: number, dto: GenerateAdminInviteCodeRequest) {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 새로운 초대 코드 생성
    const code = this.generateRandomCode();
    
    // 기존 코드를 만료시키고 새로운 코드로 업데이트
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminInviteCode: code,
        adminInviteCodeExpiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return { inviteCode: updatedUser.adminInviteCode };
  }

  async getAdminInviteCode(userId: number) {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    if (!user.adminInviteCode) {
      return null;
    }

    const now = new Date();
    const isExpired = user.adminInviteCodeExpiresAt 
      ? user.adminInviteCodeExpiresAt < now 
      : false;

    return {
      code: user.adminInviteCode,
      createdAt: user.createdAt,
      expiresAt: user.adminInviteCodeExpiresAt,
      isExpired,
    };
  }

  async getOrphanedUsers(userId: number, cursor?: string, take: number = 20) {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const where = {
      teamId: null,
      deletedAt: null,
    };

    const users = await this.prisma.user.findMany({
      where,
      take: take + 1,
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      orderBy: { id: 'desc' },
    });

    const hasNext = users.length > take;
    const items = hasNext ? users.slice(0, take) : users;
    const nextCursor = hasNext ? items[items.length - 1].id.toString() : null;

    return {
      items,
      nextCursor,
    };
  }

  async softDeleteUser(adminUserId: number, targetUserId: number) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 자신은 삭제할 수 없음
    if (adminUserId === targetUserId) {
      throw new AppError('FORBIDDEN');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async getDeletedUsers(userId: number, cursor?: string, take: number = 20) {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const where = {
      deletedAt: { not: null },
    };

    const users = await this.prisma.user.findMany({
      where,
      take: take + 1,
      cursor: cursor ? { id: parseInt(cursor) } : undefined,
      orderBy: { id: 'desc' },
    });

    const hasNext = users.length > take;
    const items = hasNext ? users.slice(0, take) : users;
    const nextCursor = hasNext ? items[items.length - 1].id.toString() : null;

    return {
      items,
      nextCursor,
    };
  }

  async restoreUser(adminUserId: number, targetUserId: number) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt: null },
    });

    return { success: true };
  }

  async getAllUsers(
    userId: number,
    limit: number = 10,
    cursor?: number,
    searchKeyword?: string,
  ): Promise<CursorResponse<UserResponse>> {
    // ADMIN 권한 확인
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    const take = limit ?? 10;

    // 검색 조건 추가
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(searchKeyword && {
        OR: [
          { name: { contains: searchKeyword, mode: 'insensitive' } },
          { email: { contains: searchKeyword, mode: 'insensitive' } },
        ],
      }),
    };

    const users = await this.prisma.user.findMany({
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

    const hasNextPage = users.length > take;
    const trimmed = hasNextPage ? users.slice(0, -1) : users;

    return {
      items: trimmed.map(mapToUserResponse),
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }

  async assignCoachToTeam(
    adminUserId: number,
    teamId: number,
    coachUserId: number,
  ) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 코치로 지정할 유저 확인
    const coachUser = await this.prisma.user.findUnique({ where: { id: coachUserId } });
    if (!coachUser) {
      throw new AppError('USER_NOT_FOUND');
    }

    if (coachUser.deletedAt) {
      throw new AppError('USER_NOT_FOUND');
    }

    // 기존 코치가 있다면 해당 팀의 코치 관계 해제
    if (team.coachId) {
      // 기존 코치의 role을 PLAYER로 변경 (ADMIN이 아닌 경우)
      const existingCoach = await this.prisma.user.findUnique({
        where: { id: team.coachId },
      });
      if (existingCoach && existingCoach.role === 'COACH') {
        await this.prisma.user.update({
          where: { id: team.coachId },
          data: { role: 'PLAYER' },
        });
      }
    }

    // 새 코치로 등록
    await this.prisma.team.update({
      where: { id: teamId },
      data: { coachId: coachUserId },
    });

    // 코치의 role을 COACH로 변경
    await this.prisma.user.update({
      where: { id: coachUserId },
      data: { role: 'COACH' },
    });

    // 코치를 해당 팀의 멤버로도 추가 (이미 멤버가 아닌 경우)
    if (coachUser.teamId !== teamId) {
      await this.prisma.user.update({
        where: { id: coachUserId },
        data: { teamId: teamId },
      });
    }

    return { success: true };
  }

  async createCoach(userId: number, dto: CreateCoachRequest) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new AppError('EMAIL_ALREADY_EXISTS');
    }

    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({ where: { id: dto.teamId } });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    if (team.deletedAt) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 비밀번호 암호화 (회원가입과 동일한 로직)
    const hashed = await this.authService.hashPassword(dto.password);

    // 기존 코치가 있다면 해당 팀의 코치 관계 해제
    if (team.coachId) {
      const existingCoach = await this.prisma.user.findUnique({
        where: { id: team.coachId },
      });
      if (existingCoach && existingCoach.role === 'COACH') {
        await this.prisma.user.update({
          where: { id: team.coachId },
          data: { role: 'PLAYER' },
        });
      }
    }

    // 코치 계정 생성
    const newCoach = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashed,
        role: 'COACH',
        teamId: dto.teamId,
      },
    });

    // 팀의 coachId 업데이트
    await this.prisma.team.update({
      where: { id: dto.teamId },
      data: { coachId: newCoach.id },
    });

    // 기본 기술 설정 (회원가입과 동일)
    await this.techniqueService.setDefaultTechnique(newCoach.id);

    return mapToUserResponse({
      ...newCoach,
      team: {
        id: team.id,
        name: team.name,
        description: team.description || null,
      },
    });
  }

  async removeCoachFromTeam(adminUserId: number, teamId: number) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 코치 확인
    if (!team.coachId) {
      throw new AppError('COACH_NOT_FOUND');
    }

    // 코치의 role을 PLAYER로 변경
    await this.prisma.user.update({
      where: { id: team.coachId },
      data: { role: 'PLAYER' },
    });

    // 팀의 coachId를 null로 설정
    await this.prisma.team.update({
      where: { id: teamId },
      data: { coachId: null },
    });

    return { success: true };
  }

  async updateTeamMaxMembers(
    adminUserId: number,
    teamId: number,
    dto: UpdateTeamMaxMembersRequest,
  ) {
    // ADMIN 권한 확인
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('UNAUTHORIZED');
    }

    // 팀 존재 확인
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    if (team.deletedAt) {
      throw new AppError('TEAM_NOT_FOUND');
    }

    // 현재 멤버 수 확인 (코치 제외)
    const currentMemberCount = await this.prisma.user.count({
      where: {
        teamId: teamId,
        deletedAt: null,
        role: 'PLAYER', // 코치는 멤버 카운트에 포함되지 않음
      },
    });

    // 최대 인원수가 설정되고, 현재 멤버 수보다 작으면 에러
    if (dto.maxMembers !== null && dto.maxMembers !== undefined && dto.maxMembers < currentMemberCount) {
      throw new AppError('TEAM_MAX_MEMBERS_EXCEEDED');
    }

    // 최대 인원수 업데이트
    await this.prisma.team.update({
      where: { id: teamId },
      data: { maxMembers: dto.maxMembers ?? null },
    });

    return { success: true };
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

