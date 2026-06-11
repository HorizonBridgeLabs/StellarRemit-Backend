import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestWithId } from '../middleware/request-id.middleware';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  requestId: string;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const requestId = request.requestId || 'unknown';

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data && 'data' in data && 'requestId' in data) {
          return {
            ...data,
            requestId,
            timestamp: new Date().toISOString(),
          } as StandardResponse<T>;
        }

        return {
          success: true,
          data: data as T,
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
