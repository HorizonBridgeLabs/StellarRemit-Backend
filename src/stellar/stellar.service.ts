import { Injectable } from '@nestjs/common';
import * as StellarSdk from 'stellar-sdk';

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
}
