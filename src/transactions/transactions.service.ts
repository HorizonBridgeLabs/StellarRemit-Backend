import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TransactionFilter {
  status?: string;
  fromDate?: string;
  toDate?: string;
  asset?: string;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(senderId: string, recipient: string, amount: number, asset = 'XLM', fee = 0) {
    return this.prisma.transaction.create({
      data: { senderId, recipient, amount, asset, status: 'pending', fee },
    });
  }

  async findAll(senderId: string, page = 1, limit = 10, filter?: TransactionFilter) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where: any = { senderId };
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.asset) {
      where.asset = filter.asset;
    }
    if (filter?.fromDate || filter?.toDate) {
      where.createdAt = {};
      if (filter.fromDate) {
        where.createdAt.gte = new Date(filter.fromDate);
      }
      if (filter.toDate) {
        where.createdAt.lte = new Date(filter.toDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
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

  async findByWallet(userId: string, walletId: string, page = 1, limit = 10) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
      select: { publicKey: true },
    });

    if (!wallet) {
      return { data: [], meta: { total: 0, page, limit: take, totalPages: 0 } };
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { senderId: userId, recipient: wallet.publicKey },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where: { senderId: userId, recipient: wallet.publicKey } }),
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

  async getReceipt(id: string, senderId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, senderId },
      include: { sender: { select: { email: true } } },
    });

    if (!transaction) {
      return null;
    }

    return {
      id: transaction.id,
      senderEmail: transaction.sender.email,
      recipient: transaction.recipient,
      amount: transaction.amount,
      fee: transaction.fee,
      asset: transaction.asset,
      status: transaction.status,
      txHash: transaction.txHash,
      createdAt: transaction.createdAt,
      total: (transaction.amount as any) + (transaction.fee as any),
    };
  }

  async updateStatus(id: string, senderId: string, status: string) {
    const result = await this.prisma.transaction.updateMany({
      where: { id, senderId },
      data: { status },
    });

    if (result.count === 0) {
      return { message: 'Transaction not found or not authorized', updated: false };
    }

    return { message: 'Transaction status updated', updated: true, status };
  }
}
