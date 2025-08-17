import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMarkingRequest } from '@/modules/marking/dto/create-marking.request';
import { NoteService } from '@/modules/note/note.service';
import { AppError } from '@/shared/error/app-error';
import { mapToMarkingRes, mapToMarkingResList } from '@/modules/marking/mapper/marking.mapper';

@Injectable()
export class MarkingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly noteService: NoteService,
  ) {}

  async create(userId: number, dto: CreateMarkingRequest) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      select: { id: true },
    });
    if (!match) throw new AppError('MATCH_NOT_FOUND');

    const created = await this.prisma.marking.create({
      data: {
        match_id: dto.matchId,
        timestamp: dto.timestamp,
        result: dto.result,
        my_type: dto.myType,
        opponent_type: dto.opponentType,
        quality: dto.quality,
        note: dto.note,
        remain_time: dto.remainTime,
        user_id: userId
      },
    });
    
    if (dto.note?.trim()) {
      this.noteService.upsert(userId, dto.note)
    }

    return mapToMarkingRes(created);
  }

  async listByMatch(matchId: number) {
    const rows = await this.prisma.marking.findMany({
      where: { match_id: matchId, deleted_at: null },
      orderBy: [{ timestamp: 'asc' }, { id: 'asc' }],
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
    });

    return mapToMarkingRes(updated);
  }
}
