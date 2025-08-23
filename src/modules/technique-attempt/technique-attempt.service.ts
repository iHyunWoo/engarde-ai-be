import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/create-technique-attempt.request';
import { mapToGetTechniqueAttemptRes } from '@/modules/technique-attempt/mapper/technique-attempt.mapper';
import { GetTechniqueAttemptResponse } from '@/modules/technique-attempt/dto/get-technique-attempt.response';
import { AppError } from '@/shared/error/app-error';
import { UpdateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/update-technique-attempt.request';

@Injectable()
export class TechniqueAttemptService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTechniqueAttemptRequest) {
    return await this.prisma.techniqueAttempt.create({
      data: {
        user_id: userId,
        technique_id: dto.techniqueId,
        match_id: dto.matchId,
      },
      select: {
        id: true,
      },
    });
  }

  async getAttemptsByMatch(
    userId: number,
    matchId: number,
  ): Promise<GetTechniqueAttemptResponse[]> {
    const attempts = await this.prisma.techniqueAttempt.findMany({
      where: {
        user_id: userId,
        match_id: matchId,
        deleted_at: null,
      },
      include: {
        technique: true,
      },
      take: 30,
    });

    return attempts.map((attempt) => mapToGetTechniqueAttemptRes(attempt));
  }

  async updateAttempt(
    userId: number,
    techniqueAttemptId: number,
    dto: UpdateTechniqueAttemptRequest,
  ) {
    const attempt = await this.prisma.techniqueAttempt.findFirst({
      where: {
        id: techniqueAttemptId,
        user_id: userId,
        deleted_at: null
      }
    })

    if (!attempt) throw new AppError('TECHNIQUE_ATTEMPT_NOT_FOUND')

    return await this.prisma.techniqueAttempt.update({
      where: {
        id: techniqueAttemptId
      },
      data: {
        attempt_count: Math.max(0, attempt.attempt_count + dto.delta),
      },
      select: {
        id: true,
      },
    })
  }
}
