import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

export interface UserStats {
  walletCount: number;
  transactionCount: number;
  totalSent: number;
  pendingTransactions: number;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, createdAt: true } });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists && exists.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, createdAt: true },
    });
  }

  softDelete(id: string) {
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getStats(id: string): Promise<UserStats> {
    const [walletCount, transactionCount, totalSentAgg, pendingTransactions] = await Promise.all([
      this.prisma.wallet.count({ where: { userId: id } }),
      this.prisma.transaction.count({ where: { senderId: id } }),
      this.prisma.transaction.aggregate({
        where: { senderId: id, status: { in: ['completed', 'pending'] } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where: { senderId: id, status: 'pending' } }),
    ]);

    return {
      walletCount,
      transactionCount,
      totalSent: totalSentAgg._sum.amount?.toNumber() ?? 0,
      pendingTransactions,
    };
  }
}
