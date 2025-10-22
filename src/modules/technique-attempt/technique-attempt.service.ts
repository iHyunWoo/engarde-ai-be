import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';
import { CreateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/create-technique-attempt.request';
import { mapToGetTechniqueAttemptRes } from '@/modules/technique-attempt/mapper/technique-attempt.mapper';
import { GetTechniqueAttemptResponse } from '@/modules/technique-attempt/dto/get-technique-attempt.response';
import { AppError } from '@/shared/error/app-error';
import { UpdateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/update-technique-attempt.request';
import { TechniqueAttemptResponse } from '@/modules/technique-attempt/dto/technique-attempt.response';

@Injectable()
export class TechniqueAttemptService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTechniqueAttemptRequest): Promise<TechniqueAttemptResponse> {
    // 이미 해당 매치에 같은 기술 시도가 있는지 확인
    const existingAttempt = await this.prisma.techniqueAttempt.findFirst({
      where: {
        userId: userId,
        techniqueId: dto.techniqueId,
        matchId: dto.matchId,
        deletedAt: null,
      },
    });

    if (existingAttempt) {
      throw new AppError('TECHNIQUE_ATTEMPT_ALREADY_EXISTS');
    }

    const attempt = await this.prisma.techniqueAttempt.create({
      data: {
        userId: userId,
        techniqueId: dto.techniqueId,
        matchId: dto.matchId,
      },
      include: {
        technique: true,
      },
    });

    return mapToGetTechniqueAttemptRes(attempt)
  }

  async getAttemptsByMatch(
    userId: number,
    matchId: number,
  ): Promise<GetTechniqueAttemptResponse[]> {
    const attempts = await this.prisma.techniqueAttempt.findMany({
      where: {
        userId: userId,
        matchId: matchId,
        deletedAt: null,
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
        userId: userId,
        deletedAt: null
      }
    })

    if (!attempt) throw new AppError('TECHNIQUE_ATTEMPT_NOT_FOUND')

    return await this.prisma.techniqueAttempt.update({
      where: {
        id: techniqueAttemptId
      },
      data: {
        attemptCount: Math.max(0, attempt.attemptCount + dto.delta),
      },
      select: {
        id: true,
      },
    })
  }

  async delete(
    userId: number,
    techniqueAttemptId: number,
  ) {
    const attempt = await this.prisma.techniqueAttempt.findFirst({
      where: {
        id: techniqueAttemptId,
        userId: userId,
        deletedAt: null
      }
    })

    if (!attempt) throw new AppError('TECHNIQUE_ATTEMPT_NOT_FOUND')

    return await this.prisma.techniqueAttempt.update({
      where: {
        id: techniqueAttemptId
      },
      data: {
        deletedAt: new Date()
      },
      select: {
        id: true,
      },
    })
  }
}
