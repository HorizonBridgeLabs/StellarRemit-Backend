import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed',
  createdAt: new Date(),
};

const prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
const jwt = { sign: jest.fn().mockReturnValue('token') };

describe('AuthService.login', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('returns access_token on valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({ email: mockUser.email, password: 'password123' });

    expect(result).toEqual({ access_token: 'token' });
    expect(jwt.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
  });

  it('throws UnauthorizedException when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login({ email: 'no@user.com', password: 'pass' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException on wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(service.login({ email: mockUser.email, password: 'wrong' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
