import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMatchRequestDto } from './dto/create-match.request';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateMatchResponseDto } from '@/modules/match/dto/create-match.response';
import { GetMatchListResponse } from '@/modules/match/dto/get-match-list.response';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user_id: number, dto: CreateMatchRequestDto): Promise<CreateMatchResponseDto> {
    const match = await this.prisma.match.create({
      data: {
        video_url: dto.videoLink,
        thumbnail_url: dto.thumbnailLink,
        tournament_name: dto.tournamentName,
        tournament_date: new Date(dto.tournamentDate),
        opponent_name: dto.opponentName,
        opponent_team: dto.opponentTeam,
        my_score: dto.myScore,
        opponent_score: dto.opponentScore,
        attack_attempt_count: 0,
        parry_attempt_count: 0,
        counter_attack_attempt_count: 0,
        user_id,
      }
    });

    return {
      id: match.id
    }
  }

  async findManyWithPagination(userId: number, limit: number, cursor?: number) {
    const take = limit ?? 10;

    const matches = await this.prisma.match.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: {
        id: 'desc',
      },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasNextPage = matches.length > take;
    const trimmed = hasNextPage ? matches.slice(0, -1) : matches;

    const items: GetMatchListResponse[] = trimmed.map((match) => ({
      id: match.id,
      tournamentName: match.tournament_name,
      opponentName: match.opponent_name,
      myScore: match.my_score,
      opponentScore: match.opponent_score,
      thumbnailUrl: match.thumbnail_url,
      tournamentDate: match.tournament_date
    }));

    return {
      items,
      nextCursor: hasNextPage ? trimmed[trimmed.length - 1].id : null,
    };
  }
  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { markings: true },
    });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async delete(id: number) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');

    return this.prisma.match.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
