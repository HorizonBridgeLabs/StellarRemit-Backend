import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService, private stellar: StellarService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return { balances: [] };
    return this.stellar.getBalances(wallet.publicKey);
  }

  upsert(userId: string, publicKey: string) {
    if (!publicKey) throw new BadRequestException('publicKey is required');
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, publicKey },
      update: { publicKey },
    });
  }

  async fund(userId: string, publicKey: string) {
    if (!publicKey) throw new BadRequestException('publicKey is required');

    const friendbotResult = await this.stellar.fundAccount(publicKey);

    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, publicKey },
      update: { publicKey },
    });

    return {
      wallet,
      friendbot: friendbotResult,
    };
  }
}
