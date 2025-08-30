import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller } from '@nestjs/common';
import { StatisticService } from '@/modules/statistic/statistic.service';
import { GetStatisticRequest } from '@/modules/statistic/dto/get-statistic.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TypedQuery, TypedRoute } from '@nestia/core';
import { MatchService } from '@/modules/match/match.service';
import { GetStatisticResponse } from '@/modules/statistic/dto/get-statistic.response';
import type { GetStatisticsV2Request } from '@/modules/statistic/dto/get-statistics-v2.request';
import { GetStatisticV2Response } from '@/modules/statistic/dto/get-statistics-v2.response';

@Authenticated()
@Controller('statistics')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly matchService: MatchService
  ) {
  }

  /**
   * Deprecated
   * Use /statistics/v2
   */
  @TypedRoute.Get()
  async getStatistics(
    @User() user: JwtPayload,
    @TypedQuery() query: GetStatisticRequest,
  ) {
    const { from, to } = query;
    const userId = user.userId
    const matches = await this.matchService.findAllByDateRange(
      userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
    const matchIds = matches.map(match => match.id)

    const opponentStats = await this.statisticService.getStatisticsByOpponent(userId, matches)
    const winRate = await this.statisticService.getWinRateByTechnique(userId, matchIds)
    const lossCount = await this.statisticService.getLossTypes(userId, matchIds)

    const result: GetStatisticResponse = {
      matchCount: matchIds.length,
      opponentStats,
      winRate,
      lossCount
    }

    return new BaseResponse(200, '조회 성공', result);
  }

  @TypedRoute.Get("/v2")
  async getStatisticsV2(
    @User() user: JwtPayload,
    @TypedQuery() query: GetStatisticsV2Request,
  ): Promise<BaseResponse<GetStatisticV2Response>> {
    const { from, to, mode } = query;
    const userId = user.userId
    const matchList = await this.matchService.findAllByDateRange(
      userId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
    const matches = mode === 'all'
      ? matchList
      : matchList.filter(match => match.stage === mode);
    const matchIds = matches.map(match => match.id)

    const summary = await this.statisticService.getSummary(userId, matchIds)
    const techniquesByMatch = await this.statisticService.getTechniquesByMatch(userId, matches)
    const opponentStats = await this.statisticService.getStatisticsByOpponent(userId, matches)
    const winRate = await this.statisticService.getWinRateByTechnique(userId, matchIds)
    const lossCount = await this.statisticService.getLossTypes(userId, matchIds)

    const result: GetStatisticV2Response = {
      matchCount: matchIds.length,
      summary,
      techniquesByMatch,
      opponentStats,
      winRate,
      lossCount
    }

    return new BaseResponse(200, '조회 성공', result);
  }
}