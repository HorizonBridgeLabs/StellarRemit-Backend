import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private stellar: StellarService,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
    if (!wallet) return { balances: [] };
    return this.stellar.getBalances(wallet.publicKey);
  }

  async getTotalBalance(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { publicKey: true, label: true },
    });

    const balances = await Promise.all(
      wallets.map(async (w) => {
        const result = await this.stellar.getBalances(w.publicKey);
        return { publicKey: w.publicKey, label: w.label, balances: result.balances };
      }),
    );

    return { wallets: balances };
  }

  async getBalanceById(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return this.stellar.getBalances(wallet.publicKey);
  }

  async getAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
    });
  }

  async searchByLabel(userId: string, query: string) {
    return this.prisma.wallet.findMany({
      where: {
        userId,
        label: { contains: query, mode: 'insensitive' },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
    });
  }

  async create(userId: string, publicKey: string, label?: string) {
    if (!publicKey) throw new BadRequestException('publicKey is required');

    const existing = await this.prisma.wallet.findUnique({ where: { publicKey } });
    if (existing) {
      if (existing.userId !== userId) {
        throw new ConflictException('This Stellar address is registered by another user');
      }
      throw new ConflictException('You have already registered this Stellar address');
    }

    const walletCount = await this.prisma.wallet.count({ where: { userId } });
    const isDefault = walletCount === 0;

    try {
      return await this.prisma.wallet.create({
        data: { userId, publicKey, label, isDefault },
        select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This Stellar address is already registered');
      }
      throw error;
    }
  }

  // Maintained for backward compatibility - creates wallet if publicKey is new,
  // returns existing wallet without error if already registered by this user.
  // Note: no longer performs an update; use POST /wallet/create for explicit creation.
  async upsert(userId: string, publicKey: string) {
    if (!publicKey) throw new BadRequestException('publicKey is required');

    const existing = await this.prisma.wallet.findUnique({ where: { publicKey } });
    if (existing) {
      if (existing.userId !== userId) {
        throw new ConflictException('This Stellar address is registered by another user');
      }
      return { wallet: existing, created: false };
    }

    const walletCount = await this.prisma.wallet.count({ where: { userId } });
    try {
      const wallet = await this.prisma.wallet.create({
        data: { userId, publicKey, isDefault: walletCount === 0 },
      });
      return { wallet, created: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This Stellar address is already registered');
      }
      throw error;
    }
  }

  async fund(userId: string, publicKey: string) {
    if (!publicKey) throw new BadRequestException('publicKey is required');

    // Check ownership before funding to avoid irreversible friendbot calls
    const existing = await this.prisma.wallet.findUnique({ where: { publicKey } });
    if (existing && existing.userId !== userId) {
      throw new ConflictException('This Stellar address is registered by another user');
    }

    const friendbotResult = await this.stellar.fundAccount(publicKey);

    let wallet;
    if (existing) {
      wallet = existing;
    } else {
      const walletCount = await this.prisma.wallet.count({ where: { userId } });
      try {
        wallet = await this.prisma.wallet.create({
          data: { userId, publicKey, isDefault: walletCount === 0 },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('This Stellar address is already registered');
        }
        throw error;
      }
    }

    return {
      wallet,
      friendbot: friendbotResult,
    };
  }

  async setDefault(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    await this.prisma.wallet.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isDefault: true },
      select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
    });
  }

  async getTransactions(userId: string, walletId: string, page = 1, limit = 10) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { senderId: userId, recipient: wallet.publicKey },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({
        where: { senderId: userId, recipient: wallet.publicKey },
      }),
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

  async delete(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const wasDefault = wallet.isDefault;

    await this.prisma.wallet.delete({ where: { id: walletId } });

    if (wasDefault) {
      const remaining = await this.prisma.wallet.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (remaining) {
        await this.prisma.wallet.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }
}
