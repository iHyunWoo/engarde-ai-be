import { Controller } from '@nestjs/common';
import { MatchService } from '@/modules/match/match.service';
import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import type { VideoMergeDoneRequest } from '@/modules/match/dto/video-merge-done.request';
import { AppError } from '@/shared/error/app-error';
import type { VideoMergeFailedRequest } from '@/modules/match/dto/video-merge-failed.request';

@Controller('matches')
export class MatchJobController {
  constructor(
    private readonly matchService: MatchService,
  ) {}

  @TypedRoute.Post(':id/merge-done')
  async videoMergeDone(
    @TypedParam('id') id: number,
    @TypedBody() dto: VideoMergeDoneRequest
  ) {
    if (dto.apiKey !== process.env.API_KEY) throw new AppError('API_KEY_MISMATCH')
    await this.matchService.videoMergeDone(id, dto.objectName)
  }

  @TypedRoute.Post(':id/merge-failed')
  async videoMergeFail(
    @TypedParam('id') id: number,
    @TypedBody() dto: VideoMergeFailedRequest
  ) {
    if (dto.apiKey !== process.env.API_KEY) throw new AppError('API_KEY_MISMATCH')
    await this.matchService.videoMergeFailed(id)
  }

}