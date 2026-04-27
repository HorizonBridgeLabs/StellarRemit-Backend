import { Injectable } from '@nestjs/common';
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
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, publicKey },
      update: { publicKey },
    });
  }
}
