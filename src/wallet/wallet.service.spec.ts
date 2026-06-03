import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

const mockPrisma = {
  wallet: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockStellar = {
  getBalances: jest.fn(),
  fundAccount: jest.fn(),
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StellarService, useValue: mockStellar },
      ],
    }).compile();
    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('returns empty balances when wallet not found', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      const result = await service.getBalance('user-1');

      expect(mockPrisma.wallet.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(result).toEqual({ balances: [] });
      expect(mockStellar.getBalances).not.toHaveBeenCalled();
    });

    it('returns balances from Stellar when wallet exists', async () => {
      const publicKey = 'GABC123';
      mockPrisma.wallet.findUnique.mockResolvedValue({ userId: 'user-1', publicKey });
      mockStellar.getBalances.mockResolvedValue({ balances: [{ asset_type: 'native', balance: '100.0000000' }] });

      const result = await service.getBalance('user-1');

      expect(mockStellar.getBalances).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual({ balances: [{ asset_type: 'native', balance: '100.0000000' }] });
    });
  });
});
