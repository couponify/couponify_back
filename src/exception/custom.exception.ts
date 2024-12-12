import { HttpException } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string, status: number) {
    super(message, status);
  }
}
