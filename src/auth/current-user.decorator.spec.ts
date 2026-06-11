import { ExecutionContext } from '@nestjs/common';

// Import the raw factory via jest mock of createParamDecorator
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    createParamDecorator: (fn: (...args: any[]) => any) => ({ __factory: fn }),
  };
});

import { CurrentUser } from './current-user.decorator';

describe('CurrentUser', () => {
  it('extracts user from request', () => {
    const mockUser = { id: '1', email: 'a@b.com' };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: mockUser }) }),
    } as unknown as ExecutionContext;
    const result = (CurrentUser as any).__factory(undefined, ctx);
    expect(result).toEqual(mockUser);
  });
});
