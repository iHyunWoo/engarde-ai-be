import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { StatisticService } from '@/modules/statistic/statistic.service';
import { GetStatisticRequest } from '@/modules/statistic/dto/get-statistic.request';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';

@Authenticated()
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {
  }

  @Get()
  async getStatistics(
    @User() user: JwtPayload,
    @Query() query: GetStatisticRequest,
  ) {
    const result = await this.statisticService.getStatistics(
      user.userId,
      query
    );
    return new BaseResponse(200, '조회 성공', result);
  }
}