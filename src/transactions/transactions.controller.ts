import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private tx: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body('recipient') recipient: string,
    @Body('amount') amount: number,
    @Body('asset') asset: string,
  ) {
    return this.tx.create(user.id, recipient, amount, asset);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tx.findAll(user.id);
  }
}
