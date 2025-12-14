import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMarkingRequest } from '@/modules/marking/dto/create-marking.request';
import { NoteService } from '@/modules/note/note.service';
import { AppError } from '@/shared/error/app-error';
import { mapToMarkingRes, mapToMarkingResList } from '@/modules/marking/mapper/marking.mapper';
import { TechniqueService } from '@/modules/technique/technique.service';

@Injectable()
export class MarkingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly noteService: NoteService,
    private readonly techniqueService: TechniqueService,
  ) {}

  async create(userId: number, dto: CreateMarkingRequest) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      select: { id: true },
    });
    if (!match) throw new AppError('MATCH_NOT_FOUND');

    let myTechniqueId: number | null = null;
    let opponentTechniqueId: number | null = null;

    // myTechnique 확인
    if (dto.myTechnique) {
      const found = await this.prisma.technique.findFirst({
        where: {
          userId: userId,
          id: dto.myTechnique.id,
          deletedAt: null
        }
      });
      if (!found) throw new AppError('TECHNIQUE_NOT_FOUND');
      myTechniqueId = found.id;
    }

    // opponentTechnique 확인
    if (dto.opponentTechnique) {
      const found = await this.prisma.technique.findFirst({
        where: {
          userId: userId,
          id: dto.opponentTechnique.id,
          deletedAt: null
        }
      });
      if (!found) throw new AppError('TECHNIQUE_NOT_FOUND');
      opponentTechniqueId = found.id;
    }


    const created = await this.prisma.marking.create({
      data: {
        matchId: dto.matchId,
        timestamp: dto.timestamp,
        result: dto.result,
        myTechniqueId: myTechniqueId,
        opponentTechniqueId: opponentTechniqueId,
        quality: dto.quality,
        note: dto.note,
        pisteLocation: dto.pisteLocation,
        userId: userId
      },
      include: {
        myTechnique: true,
        opponentTechnique: true
      }
    });

    if (myTechniqueId) await this.techniqueService.useTechnique(myTechniqueId)
    if (opponentTechniqueId) await this.techniqueService.useTechnique(opponentTechniqueId)
    
    if (dto.note?.trim()) {
      this.noteService.upsert(userId, dto.note)
    }

    return mapToMarkingRes(created);
  }

  async listByMatch(userId: number, matchId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        deletedAt: true,
      },
    });
    if (!requester || requester.deletedAt) {
      throw new AppError('USER_NOT_FOUND');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: matchId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            teamId: true,
            deletedAt: true,
          },
        },
      },
    });
    if (!match || match.user.deletedAt) {
      throw new AppError('MATCH_NOT_FOUND');
    }

    const isOwner = match.userId === userId;
    let isCoachOfTeam = false;
    if (!isOwner && match.user.teamId !== null) {
      const team = await this.prisma.team.findUnique({
        where: { coachId: userId },
        select: { id: true },
      });
      isCoachOfTeam = !!team && team.id === match.user.teamId;
    }

    if (!isOwner && !isCoachOfTeam) {
      throw new AppError('UNAUTHORIZED');
    }

    const rows = await this.prisma.marking.findMany({
      where: { matchId: matchId, deletedAt: null },
      orderBy: [{ timestamp: 'asc' }, { id: 'asc' }],
      include: {
        myTechnique: true,
        opponentTechnique: true
      }
    });
    return mapToMarkingResList(rows);
  }

  async remove(id: number) {
    const exists = await this.prisma.marking.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new AppError('MARKING_NOT_FOUND');

    const updated = await this.prisma.marking.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        myTechnique: true,
        opponentTechnique: true,
      }
    });

    return mapToMarkingRes(updated);
  }
}
