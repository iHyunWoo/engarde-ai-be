import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseResponse } from '@/shared/dto/base-response.dto';

interface HttpExceptionBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception.getResponse();

    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const msg = (exceptionResponse as HttpExceptionBody).message;
      message = Array.isArray(msg) ? msg[0] : msg;
    } else {
      message = '알 수 없는 오류입니다';
    }

    response
      .status(status)
      .json(new BaseResponse(status, message, null));
  }
}