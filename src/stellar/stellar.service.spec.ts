import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StellarService } from './stellar.service';

jest.mock('stellar-sdk', () => {
  return {
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: jest.fn().mockResolvedValue({
          balances: [{ asset_type: 'native', balance: '100.0000000' }],
        }),
        submitTransaction: jest.fn().mockResolvedValue({ hash: 'tx-hash' }),
      })),
    },
    Keypair: {
      fromSecret: jest.fn().mockReturnValue({
        publicKey: () => 'GSource',
      }),
    },
    Asset: {
      native: jest.fn().mockReturnValue({ type: 'native' }),
    },
    TransactionBuilder: jest.fn().mockImplementation(() => ({
      addOperation: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({
        sign: jest.fn(),
      }),
    })),
    Networks: {
      TESTNET: 'Test SDF Network ; September 2015',
      PUBLIC: 'Public Global Stellar Network ; September 2015',
    },
    BASE_FEE: '100',
    Operation: {
      payment: jest.fn().mockReturnValue({ type: 'payment' }),
    },
  };
});

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarService],
    }).compile();
    service = module.get<StellarService>(StellarService);
  });

  describe('getBalances', () => {
    it('returns balances from horizon', async () => {
      const result = await service.getBalances('GABC');
      expect(result.balances).toEqual([{ asset_type: 'native', balance: '100.0000000' }]);
    });

    it('returns cached balances when available', async () => {
      const first = await service.getBalances('GABC');
      const second = await service.getBalances('GABC');
      expect(second).toEqual(first);
    });
  });

  describe('sendPayment', () => {
    it('builds and submits a payment transaction', async () => {
      const result = await service.sendPayment('GDest', '10', 'XLM');
      expect(result).toEqual({ hash: 'tx-hash' });
    });
  });

  describe('fundAccount', () => {
    it('throws on mainnet', async () => {
      process.env.STELLAR_NETWORK = 'public';
      const mainnetModule: TestingModule = await Test.createTestingModule({
        providers: [StellarService],
      }).compile();
      const mainnetService = mainnetModule.get<StellarService>(StellarService);

      await expect(mainnetService.fundAccount('GABC')).rejects.toThrow(BadRequestException);
      process.env.STELLAR_NETWORK = 'testnet';
    });
  });
});
