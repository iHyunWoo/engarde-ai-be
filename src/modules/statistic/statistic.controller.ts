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

@Authenticated()
@Controller('statistics')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly matchService: MatchService
  ) {
  }

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
}