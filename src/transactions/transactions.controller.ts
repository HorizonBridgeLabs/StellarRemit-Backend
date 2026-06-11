import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private tx: TransactionsService) {}

  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.tx.create(user.id, dto.recipient, dto.amount, dto.asset);
  }

  @ApiOperation({ summary: 'List transactions for current user' })
  @ApiResponse({ status: 200, description: 'List of transactions returned' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @Get()
  findAll(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.tx.findAll(user.id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status updated' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @Patch(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTransactionStatusDto) {
    return this.tx.updateStatus(id, user.id, dto.status);
  }
}
