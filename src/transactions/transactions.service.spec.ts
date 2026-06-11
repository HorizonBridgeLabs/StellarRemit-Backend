import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a transaction with pending status', async () => {
      const expected = {
        id: 'tx1',
        senderId: 'user-1',
        recipient: 'GABC',
        amount: 10,
        asset: 'XLM',
        status: 'pending',
      };
      mockPrisma.transaction.create.mockResolvedValue(expected);

      const result = await service.create('user-1', 'GABC', 10, 'XLM');
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: { senderId: 'user-1', recipient: 'GABC', amount: 10, asset: 'XLM', status: 'pending' },
      });
      expect(result).toEqual(expected);
    });

    it('defaults asset to XLM', async () => {
      const expected = {
        id: 'tx1',
        senderId: 'user-1',
        recipient: 'GABC',
        amount: 5,
        asset: 'XLM',
        status: 'pending',
        fee: 0,
      };
      mockPrisma.transaction.create.mockResolvedValue(expected);

      const result = await service.create('user-1', 'GABC', 5);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: { senderId: 'user-1', recipient: 'GABC', amount: 5, asset: 'XLM', status: 'pending', fee: 0 },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('returns paginated transactions with metadata', async () => {
      const transactions = [
        { id: 'tx1', senderId: 'user-1', amount: 10 },
        { id: 'tx2', senderId: 'user-1', amount: 20 },
      ];
      mockPrisma.transaction.findMany.mockResolvedValue(transactions);
      mockPrisma.transaction.count.mockResolvedValue(2);

      const result = await service.findAll('user-1', 1, 10);

      expect(result.data).toEqual(transactions);
      expect(result.meta).toEqual({ total: 2, page: 1, limit: 10, totalPages: 1 });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { senderId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('respects max limit of 100', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.findAll('user-1', 1, 200);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
    });
  });

  describe('updateStatus', () => {
    it('updates transaction status and returns success message', async () => {
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateStatus('tx1', 'user-1', 'completed');
      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: 'tx1', senderId: 'user-1' },
        data: { status: 'completed' },
      });
      expect(result).toEqual({ message: 'Transaction status updated', updated: true, status: 'completed' });
    });

    it('returns not found message when transaction does not exist', async () => {
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.updateStatus('tx1', 'user-1', 'completed');
      expect(result).toEqual({ message: 'Transaction not found or not authorized', updated: false });
    });
  });
});
