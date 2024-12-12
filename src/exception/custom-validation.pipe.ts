import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { format } from 'date-fns';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors) => {
        const result = errors.map(
          (error) => error.constraints[Object.keys(error.constraints)[0]],
        );
        return new BadRequestException({
          statusCode: 400,
          message: result,
          timestamp: format(new Date(), 'yyyy-MM-dd | HH:mm:ss'),
        });
      },
    });
  }
}
