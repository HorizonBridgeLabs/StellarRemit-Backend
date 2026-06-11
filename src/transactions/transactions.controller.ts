import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private tx: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.tx.create(user.id, dto.recipient, dto.amount, dto.asset);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tx.findAll(user.id);
  }
}
