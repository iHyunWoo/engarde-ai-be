import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseResponse } from '@/shared/dto/base-response.dto';
import { AppError } from '@/shared/error/app-error';

const extractHttpMessage = (exc: HttpException): string => {
  const payload = exc.getResponse();

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object' && payload !== null) {
    if ('message' in payload) {
      const msg = (payload as { message: string | string[] }).message;
      return Array.isArray(msg) ? msg.join(', ') : msg;
    }
  }

  return exc.message || 'An unknown error occurred.';
};

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: AppError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    return res
      .status(exception.code)
      .json(new BaseResponse(exception.code, exception.message, null));
  }
}

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = extractHttpMessage(exception);
    return res
      .status(status)
      .json(new BaseResponse(status, message, null));
  }
}