import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestWithId } from './request-id.middleware';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: RequestWithId, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const requestId = req.requestId || 'unknown';
      const message = `[${requestId}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
