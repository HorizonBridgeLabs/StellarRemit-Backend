import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

const mockUser = { id: '1', email: 'a@b.com', password: 'hash', createdAt: new Date() };

const prisma = {
  user: { findUnique: jest.fn() },
  blacklistedToken: { findUnique: jest.fn() },
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(prisma as any);
    jest.clearAllMocks();
  });

  it('returns user without password when found', async () => {
    prisma.blacklistedToken.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await strategy.validate({ headers: { authorization: 'Bearer token' } } as any, {
      sub: '1',
      email: 'a@b.com',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).toMatchObject({ id: '1', email: 'a@b.com' });
  });

  it('throws UnauthorizedException when user not found', async () => {
    prisma.blacklistedToken.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      strategy.validate({ headers: { authorization: 'Bearer token' } } as any, { sub: '99', email: 'x@y.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
