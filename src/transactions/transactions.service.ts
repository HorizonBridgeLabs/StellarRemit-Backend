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

  findAll(senderId: string) {
    return this.prisma.transaction.findMany({ where: { senderId }, orderBy: { createdAt: 'desc' } });
  }
}
