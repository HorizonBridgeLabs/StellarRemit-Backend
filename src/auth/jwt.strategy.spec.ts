import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

const mockUser = { id: '1', email: 'a@b.com', password: 'hash', createdAt: new Date() };

const prisma = { user: { findUnique: jest.fn() } };

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(prisma as any);
    jest.clearAllMocks();
  });

  it('returns user without password when found', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await strategy.validate({ sub: '1', email: 'a@b.com' });
    expect(result).not.toHaveProperty('password');
    expect(result).toMatchObject({ id: '1', email: 'a@b.com' });
  });

  it('throws UnauthorizedException when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(strategy.validate({ sub: '99', email: 'x@y.com' })).rejects.toThrow(UnauthorizedException);
  });
});
