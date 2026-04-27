import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { StellarModule } from '../stellar/stellar.module';

@Module({ imports: [StellarModule], providers: [WalletService], controllers: [WalletController] })
export class WalletModule {}
