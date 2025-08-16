import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { NoteService } from '@/modules/note/note.service';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';

@Authenticated()
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {
  }

  @Get('suggest')
  async suggest(
    @User() user: JwtPayload,
    @Query('query') query: string,
  ) {
    const result = await this.noteService.suggest(user.userId, query);
    return new BaseResponse(200, '조회 성공', result);
  }

}