import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller } from '@nestjs/common';
import { NoteService } from '@/modules/note/note.service';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { TypedQuery, TypedRoute } from '@nestia/core';
import { GetSuggestQuery } from '@/modules/note/dto/get-suggest.query';

@Authenticated()
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {
  }

  @TypedRoute.Get('suggest')
  async suggest(
    @User() user: JwtPayload,
    @TypedQuery() query: GetSuggestQuery,
  ) {
    const result = await this.noteService.suggest(user.userId, query.query);
    return new BaseResponse(200, '조회 성공', result);
  }

}