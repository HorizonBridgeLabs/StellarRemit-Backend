import { BadRequestException, Injectable } from '@nestjs/common';
import * as StellarSdk from 'stellar-sdk';
import * as https from 'https';

@Injectable()
export class StellarService {
  private server: StellarSdk.Horizon.Server;
  private network: string;

  constructor() {
    const isTestnet = (process.env.STELLAR_NETWORK ?? 'testnet') === 'testnet';
    this.network = isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;
    this.server = new StellarSdk.Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    );
  }

  async getBalances(publicKey: string) {
    const account = await this.server.loadAccount(publicKey);
    return { balances: account.balances };
  }

  async sendPayment(destination: string, amount: string, asset = 'XLM') {
    const secret = process.env.STELLAR_SECRET_KEY!;
    const keypair = StellarSdk.Keypair.fromSecret(secret);
    const account = await this.server.loadAccount(keypair.publicKey());
    const stellarAsset = asset === 'XLM' ? StellarSdk.Asset.native() : new StellarSdk.Asset(asset, keypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(StellarSdk.Operation.payment({ destination, asset: stellarAsset, amount }))
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    return this.server.submitTransaction(tx);
  }

  async fundAccount(publicKey: string) {
    if (this.network !== StellarSdk.Networks.TESTNET) {
      throw new BadRequestException('Friendbot is only available on the Stellar testnet');
    }

    const endpoint = new URL('https://friendbot.stellar.org');
    endpoint.searchParams.set('addr', publicKey);

    return new Promise<any>((resolve, reject) => {
      https.get(endpoint, (res) => {
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
      }).on('error', (error) => reject(new BadRequestException(`Friendbot request failed: ${error.message}`)));
    });
  }
}
