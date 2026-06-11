import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(senderId: string, recipient: string, amount: number, asset = 'XLM') {
    return this.prisma.transaction.create({
      data: { senderId, recipient, amount, asset, status: 'pending' },
    });
  }

  async findAll(senderId: string, page = 1, limit = 10) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { senderId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where: { senderId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async updateStatus(id: string, senderId: string, status: string) {
    return this.prisma.transaction.updateMany({
      where: { id, senderId },
      data: { status },
    });
  }
}
