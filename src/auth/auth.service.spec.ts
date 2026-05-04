import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
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
    it('hashes password and returns user + access_token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid',
        email: 'a@b.com',
        createdAt: new Date(),
      });

      const result = await service.register({ email: 'a@b.com', password: 'password123' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'a@b.com' }),
        }),
      );
      const hash = mockPrisma.user.create.mock.calls[0][0].data.password;
      expect(await bcrypt.compare('password123', hash)).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid' } }),
      );
      expect(result.access_token).toBe('token');
      expect(result.refresh_token).toBe('token');
    });

    it('throws ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.register({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns access_token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid', email: 'a@b.com', password: hash });

      const result = await service.login({ email: 'a@b.com', password: 'password123' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid' } }),
      );
      expect(result.access_token).toBe('token');
      expect(result.refresh_token).toBe('token');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid', email: 'a@b.com', password: hash });

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens when refresh token is valid', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'uuid', email: 'a@b.com' });
      const refreshToken = 'refresh-token';
      const hashed = await bcrypt.hash(refreshToken, 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid', email: 'a@b.com', refreshTokenHash: hashed });

      const result = await service.refresh(refreshToken);

      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(Object));
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid' } }),
      );
      expect(result.access_token).toBe('token');
      expect(result.refresh_token).toBe('token');
    });

    it('throws UnauthorizedException for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
