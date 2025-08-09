import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMarkingRequest } from '@/modules/marking/dto/create-marking.request';
import {
  toMarkingList,
  toMarkingResponse,
} from '@/modules/marking/dto/marking.response';

@Injectable()
export class MarkingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMarkingRequest) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      select: { id: true },
    });
    if (!match) throw new NotFoundException('Match not found');

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
      },
    });

    return toMarkingResponse(created);
  }

  async listByMatch(matchId: number) {
    const rows = await this.prisma.marking.findMany({
      where: { match_id: matchId, deleted_at: null },
      orderBy: [{ timestamp: 'asc' }, { id: 'asc' }],
    });
    return toMarkingList(rows);
  }

  async remove(id: number) {
    const exists = await this.prisma.marking.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Marking not found');

    const updated = await this.prisma.marking.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return toMarkingResponse(updated);
  }
}
