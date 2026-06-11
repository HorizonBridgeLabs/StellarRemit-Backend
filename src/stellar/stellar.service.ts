import { BadRequestException, Injectable } from '@nestjs/common';
import * as StellarSdk from 'stellar-sdk';
import * as https from 'https';

interface CacheEntry {
  data: { balances: StellarSdk.Horizon.HorizonApi.BalanceLine[] };
  expiresAt: number;
}

@Injectable()
export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private network: string;
  private balanceCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS: number;
  private readonly MAX_CACHE_SIZE = 1000;

  constructor() {
    const isTestnet = (process.env.STELLAR_NETWORK ?? 'testnet') === 'testnet';
    this.network = isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;
    this.server = new StellarSdk.Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    );
    const ttl = parseInt(process.env.BALANCE_CACHE_TTL_MS ?? '', 10);
    this.CACHE_TTL_MS = Number.isNaN(ttl) ? 30000 : ttl;
  }

  async getBalances(publicKey: string) {
    const cached = this.balanceCache.get(publicKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const account = await this.server.loadAccount(publicKey);
      const data = { balances: account.balances };

      this.setCacheEntry(publicKey, data);
      return data;
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new BadRequestException(`Account not found on the Stellar network: ${publicKey}`);
      }
      if (error instanceof StellarSdk.NetworkError) {
        throw new BadRequestException('Unable to connect to the Stellar network. Please try again later.');
      }
      throw new BadRequestException(
        `Failed to fetch balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private setCacheEntry(key: string, data: { balances: StellarSdk.Horizon.HorizonApi.BalanceLine[] }) {
    if (this.balanceCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.balanceCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.balanceCache.delete(oldestKey);
      }
    }
    this.balanceCache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  async sendPayment(destination: string, amount: string, asset = 'XLM') {
    const secret = process.env.STELLAR_SECRET_KEY!;
    if (!secret) {
      throw new BadRequestException('Stellar secret key is not configured');
    }

    try {
      const keypair = StellarSdk.Keypair.fromSecret(secret);
      const account = await this.server.loadAccount(keypair.publicKey());
      const stellarAsset =
        asset === 'XLM' ? StellarSdk.Asset.native() : new StellarSdk.Asset(asset, keypair.publicKey());

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.network,
      })
        .addOperation(StellarSdk.Operation.payment({ destination, asset: stellarAsset, amount }))
        .setTimeout(30)
        .build();

      tx.sign(keypair);
      return await this.server.submitTransaction(tx);
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new BadRequestException(`Account not found on the Stellar network: ${destination}`);
      }
      if (error instanceof StellarSdk.NetworkError) {
        throw new BadRequestException('Unable to connect to the Stellar network. Please try again later.');
      }
      throw new BadRequestException(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fundAccount(publicKey: string) {
    if (this.network !== StellarSdk.Networks.TESTNET) {
      throw new BadRequestException('Friendbot is only available on the Stellar testnet');
    }

    const endpoint = new URL('https://friendbot.stellar.org');
    endpoint.searchParams.set('addr', publicKey);

    return new Promise<any>((resolve, reject) => {
      https
        .get(endpoint, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });

          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(body));
              } catch (error) {
                resolve({ result: body });
              }
              return;
            }

            reject(new BadRequestException(`Friendbot request failed with status ${res.statusCode}: ${body}`));
          });
        })
        .on('error', (error) => reject(new BadRequestException(`Friendbot request failed: ${error.message}`)));
    });
  }
}
