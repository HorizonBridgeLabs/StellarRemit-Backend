import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get('balance')
  balance(@CurrentUser() user: any) {
    return this.wallet.getBalance(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: any, @Body('publicKey') publicKey: string) {
    return this.wallet.upsert(user.id, publicKey);
  }
}
