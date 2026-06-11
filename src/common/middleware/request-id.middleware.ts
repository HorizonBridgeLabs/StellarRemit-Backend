import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    req.requestId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('x-request-id', req.requestId);
    next();
  }
}
