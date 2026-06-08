import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';
import { UpsertWalletDto, CreateWalletDto } from './dto/wallet.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.wallet.getAll(user.id);
  }

  @Get('balance')
  balance(@CurrentUser() user: any) {
    return this.wallet.getBalance(user.id);
  }

  @Get(':id/balance')
  balanceById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.getBalanceById(user.id, id);
  }

  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: UpsertWalletDto) {
    return this.wallet.upsert(user.id, dto.publicKey);
  }

  @Post('create')
  create(@CurrentUser() user: any, @Body() dto: CreateWalletDto) {
    return this.wallet.create(user.id, dto.publicKey, dto.label);
  }

  @Post('fund')
  fund(@CurrentUser() user: any, @Body() dto: UpsertWalletDto) {
    return this.wallet.fund(user.id, dto.publicKey);
  }

  @Patch(':id/default')
  setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.setDefault(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.delete(user.id, id);
  }
}
