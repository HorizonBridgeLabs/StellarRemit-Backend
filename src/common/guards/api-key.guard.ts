import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;
    const validKey = process.env.INTERNAL_API_KEY;

    if (!validKey) {
      throw new UnauthorizedException('Internal API key not configured');
    }

    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
