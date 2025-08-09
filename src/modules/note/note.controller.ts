import { Authenticated } from '@/shared/decorators/authenticated.decorator';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { NoteService } from '@/modules/note/note.service';
import { User } from '@/shared/decorators/user.decorator';
import type { JwtPayload } from '@/modules/auth/guards/jwt-payload';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import type { Response } from 'express';

@Authenticated()
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {
  }

  @Get('suggest')
  async suggest(
    @User() user: JwtPayload,
    @Query('query') query: string,
    @Res() res: Response
  ) {
    const result = await this.noteService.suggest(user.userId, query);
    const response = new BaseResponse(200, '조회 성공', result);
    return res.status(200).json(response);
  }

}