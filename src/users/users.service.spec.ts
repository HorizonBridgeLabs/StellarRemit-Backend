import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns user without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com', createdAt: new Date() });
      const result = await service.findById('1');
      expect(result).toMatchObject({ id: '1', email: 'a@b.com' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, email: true, createdAt: true },
      });
    });
  });

  describe('update', () => {
    it('updates email and password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ id: '1', email: 'new@b.com', createdAt: new Date() });

      const result = await service.update('1', { email: 'new@b.com', password: 'newpass123' });
      expect(result.email).toBe('new@b.com');
    });

    it('throws ConflictException if email already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '2', email: 'taken@b.com' });
      await expect(service.update('1', { email: 'taken@b.com' })).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt timestamp', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
      const result = await service.softDelete('1');
      expect(result.deletedAt).toBeDefined();
    });
  });
});
