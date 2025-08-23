import { Controller } from '@nestjs/common';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { TechniqueAttemptService } from '@/modules/technique-attempt/technique-attempt.service';
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TechniqueAttemptResponse } from '@/modules/technique-attempt/dto/technique-attempt.response';
import { GetTechniqueAttemptsQuery } from '@/modules/technique-attempt/dto/get-technique-attempts.query';
import { UpdateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/update-technique-attempt.request';
import { CreateTechniqueAttemptRequest } from '@/modules/technique-attempt/dto/create-technique-attempt.request';

@Authenticated()
@Controller("techniques/attempts")
export class TechniqueAttemptController {
  constructor(private readonly techniqueAttemptService: TechniqueAttemptService) {
  }

  @TypedRoute.Post()
  async create(
    @User() user: JwtPayload,
    @TypedBody() dto: CreateTechniqueAttemptRequest,
  ): Promise<BaseResponse<TechniqueAttemptResponse>> {
    const result = await this.techniqueAttemptService.create(user.userId, dto)
    return new BaseResponse(200, '생성 성공', result)
  }

  @TypedRoute.Get("")
  async getAttemptsByMatch(
    @User() user: JwtPayload,
    @TypedQuery() query: GetTechniqueAttemptsQuery,
  ): Promise<BaseResponse<TechniqueAttemptResponse[]>> {
    const { matchId } = query
    const result = await this.techniqueAttemptService.getAttemptsByMatch(user.userId, matchId)
    return new BaseResponse(200, '조회 성공', result)
  }

  @TypedRoute.Put(":id")
  async updateAttempt(
    @User() user: JwtPayload,
    @TypedParam('id') id: number,
    @TypedBody() dto: UpdateTechniqueAttemptRequest
  ) {
  const result = await this.techniqueAttemptService.updateAttempt(user.userId, id, dto)
  return new BaseResponse(200, '변경 성공', result)
  }
}