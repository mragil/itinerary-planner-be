import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const startTime = Date.now();

    this.logger.log(`${method} ${originalUrl} - Start`);

    response.on('finish', () => {
      const { statusCode } = response;
      const responseTime = Date.now() - startTime;
      const userIdentifier = request['user']
        ? `${request['user']?.sub} - ${request['user']?.email}`
        : 'anonymous';
      this.logger.log(
        `[User: ${userIdentifier}] ${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip}`,
      );
    });

    next();
  }
}
