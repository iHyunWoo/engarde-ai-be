import { ErrorKey, ERRORS } from '@/shared/error/errors';

export class AppError extends Error {
  public readonly code: number;
  public readonly key: ErrorKey;

  constructor(key: ErrorKey) {
    super(ERRORS[key].message);
    this.key = key;
    this.code = ERRORS[key].code;
  }
}