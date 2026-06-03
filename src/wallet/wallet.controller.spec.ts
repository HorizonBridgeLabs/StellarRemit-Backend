import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const mockWalletService = {
  getBalance: jest.fn(),
  upsert: jest.fn(),
  fund: jest.fn(),
};

const user = { id: 'user-1', email: 'test@example.com' };

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: mockWalletService }],
    }).compile();
    controller = module.get<WalletController>(WalletController);
    jest.clearAllMocks();
  });

  describe('GET /wallet/balance', () => {
    it('returns balances for the current user', async () => {
      const expected = { balances: [{ asset_type: 'native', balance: '100.0000000' }] };
      mockWalletService.getBalance.mockResolvedValue(expected);

      const result = await controller.balance(user as any);

      expect(mockWalletService.getBalance).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });

    it('returns empty balances when user has no wallet', async () => {
      mockWalletService.getBalance.mockResolvedValue({ balances: [] });

      const result = await controller.balance(user as any);

      expect(result).toEqual({ balances: [] });
    });
  });
});
