import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResult {
  status: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latencyMs: number };
  };
}

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }
    const latencyMs = Date.now() - start;

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: dbStatus, latencyMs },
      },
    };
  }
}
