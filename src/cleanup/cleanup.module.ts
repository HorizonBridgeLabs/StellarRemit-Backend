import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [CleanupService],
})
export class CleanupModule {}
