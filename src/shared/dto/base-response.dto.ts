export class BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T | null;

  constructor(code: number, message: string, data?: T | null) {
    this.code = code;
    this.message = message;
    this.data = data ?? null;
  }
}