import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

function getInfo(exception: unknown): { statusCode: number; message: string } {
  const logger = new Logger('DomainExceptionFilter');
  if (exception instanceof HttpException) {
    let message = exception.message;
    if (typeof exception === 'object') {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        message = response.message as string;
      }
    }

    logger.error(`HTTP Exception: ${message}`);
    return { statusCode: exception.getStatus(), message };
  }
  console.log(exception);
  logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  };
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { statusCode, message } = getInfo(exception);

    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(statusCode).json(responseBody);
  }
}
