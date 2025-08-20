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

    const [myTechnique, opponentTechnique] = await Promise.all([
      this.prisma.technique.findFirst({
        where: {
          user_id: userId,
          id: dto.myTechnique.id,
          deleted_at: null
        }
      }),
      this.prisma.technique.findFirst({
        where: {
          user_id: userId,
          id: dto.opponentTechnique.id,
          deleted_at: null
        }
      })
    ])

    if (!myTechnique || !opponentTechnique) throw new AppError('TECHNIQUE_NOT_FOUND')

    const created = await this.prisma.marking.create({
      data: {
        match_id: dto.matchId,
        timestamp: dto.timestamp,
        result: dto.result,
        my_technique_id: myTechnique.id,
        opponent_technique_id: opponentTechnique.id,
        quality: dto.quality,
        note: dto.note,
        remain_time: dto.remainTime,
        user_id: userId
      },
      include: {
        my_technique: true,
        opponent_technique: true
      }
    });

    await this.techniqueService.useTechnique(myTechnique.id)
    await this.techniqueService.useTechnique(opponentTechnique.id)
    
    if (dto.note?.trim()) {
      this.noteService.upsert(userId, dto.note)
    }

    return mapToMarkingRes(created);
  }

  async listByMatch(matchId: number) {
    const rows = await this.prisma.marking.findMany({
      where: { match_id: matchId, deleted_at: null },
      orderBy: [{ timestamp: 'asc' }, { id: 'asc' }],
      include: {
        my_technique: true,
        opponent_technique: true
      }
    });
    return mapToMarkingResList(rows);
  }

  async remove(id: number) {
    const exists = await this.prisma.marking.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!exists) throw new AppError('MARKING_NOT_FOUND');

    const updated = await this.prisma.marking.update({
      where: { id },
      data: { deleted_at: new Date() },
      include: {
        my_technique: true,
        opponent_technique: true,
      }
    });

    return mapToMarkingRes(updated);
  }
}
