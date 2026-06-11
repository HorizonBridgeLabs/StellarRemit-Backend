import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';

const mockPrisma = {
  wallet: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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
    jest.resetAllMocks();
  });

  describe('getBalance', () => {
    it('returns empty balances when wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      const result = await service.getBalance('user-1');

      expect(mockPrisma.wallet.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { isDefault: 'desc' },
      });
      expect(result).toEqual({ balances: [] });
      expect(mockStellar.getBalances).not.toHaveBeenCalled();
    });

    it('returns balances from Stellar when wallet exists', async () => {
      const publicKey = 'GABC123';
      mockPrisma.wallet.findFirst.mockResolvedValue({ userId: 'user-1', publicKey });
      mockStellar.getBalances.mockResolvedValue({ balances: [{ asset_type: 'native', balance: '100.0000000' }] });

      const result = await service.getBalance('user-1');

      expect(mockStellar.getBalances).toHaveBeenCalledWith(publicKey);
      expect(result).toEqual({ balances: [{ asset_type: 'native', balance: '100.0000000' }] });
    });
  });

  describe('getBalanceById', () => {
    it('throws NotFoundException when wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(service.getBalanceById('user-1', 'wallet-1')).rejects.toThrow(NotFoundException);
    });

    it('returns balances for a specific wallet', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'wallet-1', userId: 'user-1', publicKey: 'GABC123' });
      mockStellar.getBalances.mockResolvedValue({ balances: [{ asset_type: 'native', balance: '50.0000000' }] });

      const result = await service.getBalanceById('user-1', 'wallet-1');

      expect(result).toEqual({ balances: [{ asset_type: 'native', balance: '50.0000000' }] });
    });
  });

  describe('getAll', () => {
    it('returns list of wallets for user', async () => {
      const wallets = [
        { id: 'w1', publicKey: 'GA...', label: null, isDefault: true, createdAt: new Date() },
        { id: 'w2', publicKey: 'GB...', label: 'savings', isDefault: false, createdAt: new Date() },
      ];
      mockPrisma.wallet.findMany.mockResolvedValue(wallets);

      const result = await service.getAll('user-1');

      expect(mockPrisma.wallet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
      });
      expect(result).toEqual(wallets);
    });
  });

  describe('create', () => {
    it('creates a new wallet for user', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(0);
      const wallet = { id: 'w1', publicKey: 'GA...', label: 'main', isDefault: true, createdAt: new Date() };
      mockPrisma.wallet.create.mockResolvedValue(wallet);

      const result = await service.create('user-1', 'GA...', 'main');

      expect(result).toEqual(wallet);
      expect(mockPrisma.wallet.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', publicKey: 'GA...', label: 'main', isDefault: true },
        select: { id: true, publicKey: true, label: true, isDefault: true, createdAt: true },
      });
    });

    it('throws if publicKey already exists for same user', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ userId: 'user-1', publicKey: 'GA...' });

      await expect(service.create('user-1', 'GA...')).rejects.toThrow(ConflictException);
    });

    it('throws if publicKey already exists for different user', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ userId: 'user-2', publicKey: 'GA...' });

      await expect(service.create('user-1', 'GA...')).rejects.toThrow(ConflictException);
    });
  });

  describe('upsert', () => {
    it('creates wallet if publicKey does not exist', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(0);
      mockPrisma.wallet.create.mockResolvedValue({ id: 'w1', userId: 'user-1', publicKey: 'GA...' });

      const result = await service.upsert('user-1', 'GA...');

      expect(result.created).toBe(true);
    });

    it('returns existing wallet if already registered', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ id: 'w1', userId: 'user-1', publicKey: 'GA...' });

      const result = await service.upsert('user-1', 'GA...');

      expect(result.created).toBe(false);
    });

    it('throws if publicKey belongs to another user', async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue({ userId: 'user-2', publicKey: 'GA...' });

      await expect(service.upsert('user-1', 'GA...')).rejects.toThrow(ConflictException);
    });
  });

  describe('fund', () => {
    it('funds account via friendbot and creates wallet', async () => {
      mockStellar.fundAccount.mockResolvedValue({ result: 'ok' });
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.count.mockResolvedValue(0);
      mockPrisma.wallet.create.mockResolvedValue({ id: 'w1', userId: 'user-1', publicKey: 'GA...' });

      const result = await service.fund('user-1', 'GA...');

      expect(mockStellar.fundAccount).toHaveBeenCalledWith('GA...');
      expect(result.friendbot).toEqual({ result: 'ok' });
      expect(result.wallet).toBeDefined();
    });
  });

  describe('setDefault', () => {
    it('sets wallet as default', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w1', userId: 'user-1', publicKey: 'GA...' });
      mockPrisma.wallet.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.wallet.update.mockResolvedValue({
        id: 'w1',
        publicKey: 'GA...',
        label: null,
        isDefault: true,
        createdAt: new Date(),
      });

      const result = await service.setDefault('user-1', 'w1');

      expect(result.isDefault).toBe(true);
    });

    it('throws NotFoundException if wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(service.setDefault('user-1', 'w1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes default wallet and sets another as default', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValueOnce({ id: 'w1', userId: 'user-1', isDefault: true });
      mockPrisma.wallet.delete.mockResolvedValue({ id: 'w1' });
      mockPrisma.wallet.findFirst.mockResolvedValueOnce({ id: 'w2', userId: 'user-1' });
      mockPrisma.wallet.update.mockResolvedValue({ id: 'w2' });

      const result = await service.delete('user-1', 'w1');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.wallet.update).toHaveBeenCalled();
    });

    it('deletes non-default wallet without promoting another', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue({ id: 'w2', userId: 'user-1', isDefault: false });
      mockPrisma.wallet.delete.mockResolvedValue({ id: 'w2' });

      const result = await service.delete('user-1', 'w2');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if wallet not found', async () => {
      mockPrisma.wallet.findFirst.mockResolvedValue(null);

      await expect(service.delete('user-1', 'w1')).rejects.toThrow(NotFoundException);
    });
  });
});
