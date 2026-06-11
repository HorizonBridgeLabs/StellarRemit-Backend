import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionResponseDto, TransactionStatusResponseDto } from './dto/transaction-response.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private tx: TransactionsService) {}

  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionResponseDto })
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.tx.create(user.id, dto.recipient, dto.amount, dto.asset);
  }

  @ApiOperation({ summary: 'List transactions for current user' })
  @ApiResponse({ status: 200, description: 'List of transactions returned' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'Filter from date (ISO 8601)' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'Filter to date (ISO 8601)' })
  @ApiQuery({ name: 'asset', required: false, type: String, description: 'Filter by asset' })
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() filter?: TransactionFilterDto,
  ) {
    return this.tx.findAll(user.id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10, filter);
  }

  @ApiOperation({ summary: 'List transactions for a specific wallet' })
  @ApiResponse({ status: 200, description: 'Wallet transactions returned' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('wallet/:id')
  findByWallet(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tx.findByWallet(user.id, id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  @ApiOperation({ summary: 'Update transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status updated', type: TransactionStatusResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @Patch(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTransactionStatusDto) {
    return this.tx.updateStatus(id, user.id, dto.status);
  }
}
