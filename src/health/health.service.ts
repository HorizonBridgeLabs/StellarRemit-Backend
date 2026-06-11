import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

class DatabaseCheck {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 5 })
  latencyMs: number;
}

export class HealthCheckResult {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 123.45 })
  uptime: number;

  @ApiProperty({ type: DatabaseCheck })
  checks: {
    database: DatabaseCheck;
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
