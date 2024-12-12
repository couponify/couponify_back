import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { CustomException } from './custom.exception';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const req = context.getRequest();
    const res = context.getResponse();

    const message = exception.message;
    const status = exception.getStatus();

    Logger.error(message);

    res.status(status).json({
      statusCode: status,
      message,
      timestamp: format(new Date(), 'yyyy-MM-dd | HH:mm:ss'),
      path: req.url,
    });
  }
}
