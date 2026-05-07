import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authService = { login: jest.fn(), logout: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();
    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('calls AuthService.login and returns result', async () => {
    const dto = { email: 'test@example.com', password: 'password123' };
    const expected = { access_token: 'jwt-token' };
    authService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('calls AuthService.logout and returns result', async () => {
    const expected = { success: true };
    authService.logout.mockResolvedValue(expected);

    const result = await controller.logout(
      { id: 'uuid', email: 'a@b.com' } as any,
      { headers: { authorization: 'Bearer access-token' } } as any,
      { refreshToken: 'refresh-token' },
    );

    expect(authService.logout).toHaveBeenCalledWith('uuid', 'access-token', 'refresh-token');
    expect(result).toEqual(expected);
  });
});
