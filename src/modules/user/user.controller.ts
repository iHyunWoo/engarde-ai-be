import {
  Controller,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserRequest } from './dto/update-user.request';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { TypedBody, TypedRoute } from '@nestia/core';

@Authenticated()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @TypedRoute.Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@User() user: JwtPayload) {
    const result = await this.userService.getMyProfile(user.userId);
    return new BaseResponse(HttpStatus.OK, '내 정보 조회 성공', result);
  }

  @TypedRoute.Put('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @User() user: JwtPayload,
    @TypedBody() dto: UpdateUserRequest,
  ) {
    const result = await this.userService.updateMyProfile(user.userId, dto);
    return new BaseResponse(HttpStatus.OK, '내 정보 수정 성공', result);
  }
}
