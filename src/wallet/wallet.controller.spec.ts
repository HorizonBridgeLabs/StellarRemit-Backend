import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const mockWalletService = {
  getBalance: jest.fn(),
  getBalanceById: jest.fn(),
  getAll: jest.fn(),
  upsert: jest.fn(),
  create: jest.fn(),
  fund: jest.fn(),
  setDefault: jest.fn(),
  delete: jest.fn(),
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
    jest.resetAllMocks();
  });

  describe('GET /wallet', () => {
    it('returns all wallets for the current user', async () => {
      const expected = [{ id: 'w1', publicKey: 'GA...' }];
      mockWalletService.getAll.mockResolvedValue(expected);

      const result = await controller.getAll(user as any);

      expect(mockWalletService.getAll).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
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

  describe('GET /wallet/:id/balance', () => {
    it('returns balances for a specific wallet', async () => {
      const expected = { balances: [{ asset_type: 'native', balance: '50.0000000' }] };
      mockWalletService.getBalanceById.mockResolvedValue(expected);

      const result = await controller.balanceById(user as any, 'wallet-1');

      expect(mockWalletService.getBalanceById).toHaveBeenCalledWith('user-1', 'wallet-1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /wallet', () => {
    it('upserts wallet for the current user', async () => {
      const dto = { publicKey: 'GABC123' };
      const expected = { wallet: { id: 'w1' }, created: true };
      mockWalletService.upsert.mockResolvedValue(expected);

      const result = await controller.upsert(user as any, dto);

      expect(mockWalletService.upsert).toHaveBeenCalledWith('user-1', 'GABC123');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /wallet/create', () => {
    it('creates a new wallet with label', async () => {
      const dto = { publicKey: 'GABC123', label: 'savings' };
      const expected = { id: 'w1', publicKey: 'GABC123', label: 'savings' };
      mockWalletService.create.mockResolvedValue(expected);

      const result = await controller.create(user as any, dto);

      expect(mockWalletService.create).toHaveBeenCalledWith('user-1', 'GABC123', 'savings');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /wallet/fund', () => {
    it('funds a wallet for the current user', async () => {
      const dto = { publicKey: 'GABC123' };
      const expected = { wallet: {}, friendbot: { result: 'ok' } };
      mockWalletService.fund.mockResolvedValue(expected);

      const result = await controller.fund(user as any, dto);

      expect(mockWalletService.fund).toHaveBeenCalledWith('user-1', 'GABC123');
      expect(result).toEqual(expected);
    });
  });

  describe('PATCH /wallet/:id/default', () => {
    it('sets a wallet as default', async () => {
      const expected = { id: 'w1', isDefault: true };
      mockWalletService.setDefault.mockResolvedValue(expected);

      const result = await controller.setDefault(user as any, 'wallet-1');

      expect(mockWalletService.setDefault).toHaveBeenCalledWith('user-1', 'wallet-1');
      expect(result).toEqual(expected);
    });
  });

  describe('DELETE /wallet/:id', () => {
    it('deletes a wallet', async () => {
      mockWalletService.delete.mockResolvedValue({ success: true });

      const result = await controller.remove(user as any, 'wallet-1');

      expect(mockWalletService.delete).toHaveBeenCalledWith('user-1', 'wallet-1');
      expect(result).toEqual({ success: true });
    });
  });
});
