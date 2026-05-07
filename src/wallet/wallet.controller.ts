import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';
import { UpsertWalletDto } from './dto/wallet.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get('balance')
  balance(@CurrentUser() user: any) {
    return this.wallet.getBalance(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: UpsertWalletDto) {
    return this.wallet.upsert(user.id, dto.publicKey);
  }
}
