import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    const now = new Date();
    const result = await this.prisma.blacklistedToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    this.logger.log(`Cleaned up ${result.count} expired blacklisted tokens`);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupSoftDeletedUsers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.user.deleteMany({
      where: {
        deletedAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(`Permanently deleted ${result.count} soft-deleted users older than 30 days`);
  }
}
