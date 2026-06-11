import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  blacklistedToken: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
  decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
};

describe('AuthService - Email Verification', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('generates verification token on registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        createdAt: new Date(),
        isVerified: false,
      });

      const result = await service.register({ email: 'test@example.com', password: 'password123' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            verificationToken: expect.any(String),
          }),
        }),
      );
      expect(result.user).toBeDefined();
      expect(result.access_token).toBe('test-token');
    });
  });

  describe('verifyEmail', () => {
    it('verifies email with valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', email: 'test@example.com', isVerified: false });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-id', isVerified: true });

      const result = await service.verifyEmail('valid-token');

      expect(result.verified).toBe(true);
      expect(result.email).toBe('test@example.com');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isVerified: true, verificationToken: null },
      });
    });

    it('throws BadRequestException for invalid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });
});
