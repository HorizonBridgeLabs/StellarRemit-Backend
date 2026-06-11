import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WalletService } from './wallet.service';
import { UpsertWalletDto, CreateWalletDto } from './dto/wallet.dto';
import {
  WalletResponseDto,
  WalletBalanceResponseDto,
  WalletWithBalancesResponseDto,
  FundWalletResponseDto,
  WalletSuccessResponseDto,
} from './dto/wallet-response.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @ApiOperation({ summary: 'Get all wallets for current user' })
  @ApiResponse({ status: 200, description: 'List of wallets returned', type: [WalletResponseDto] })
  @Get()
  getAll(@CurrentUser() user: any) {
    return this.wallet.getAll(user.id);
  }

  @ApiOperation({ summary: 'Search wallets by label' })
  @ApiResponse({ status: 200, description: 'Matching wallets returned', type: [WalletResponseDto] })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query for wallet label' })
  @Get('search')
  search(@CurrentUser() user: any, @Query('q') q: string) {
    return this.wallet.searchByLabel(user.id, q);
  }

  @ApiOperation({ summary: 'Get transaction history for a specific wallet' })
  @ApiResponse({ status: 200, description: 'Wallet transaction history returned' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get(':id/transactions')
  getTransactions(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.wallet.getTransactions(user.id, id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  @ApiOperation({ summary: 'Get total balance across all wallets' })
  @ApiResponse({ status: 200, description: 'Total balances returned', type: WalletWithBalancesResponseDto })
  @Get('total-balance')
  totalBalance(@CurrentUser() user: any) {
    return this.wallet.getTotalBalance(user.id);
  }

  @ApiOperation({ summary: 'Get balance of default wallet' })
  @ApiResponse({ status: 200, description: 'Wallet balances returned', type: WalletBalanceResponseDto })
  @Get('balance')
  balance(@CurrentUser() user: any) {
    return this.wallet.getBalance(user.id);
  }

  @ApiOperation({ summary: 'Get balance of a specific wallet' })
  @ApiResponse({ status: 200, description: 'Wallet balances returned', type: WalletBalanceResponseDto })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @Get(':id/balance')
  balanceById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.getBalanceById(user.id, id);
  }

  @ApiOperation({ summary: 'Upsert a wallet by public key' })
  @ApiResponse({ status: 200, description: 'Wallet upserted successfully', type: WalletResponseDto })
  @ApiResponse({ status: 409, description: 'Wallet already registered by another user' })
  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: UpsertWalletDto) {
    return this.wallet.upsert(user.id, dto.publicKey);
  }

  @ApiOperation({ summary: 'Create a new wallet with optional label' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully', type: WalletResponseDto })
  @ApiResponse({ status: 409, description: 'Wallet already registered' })
  @Post('create')
  create(@CurrentUser() user: any, @Body() dto: CreateWalletDto) {
    return this.wallet.create(user.id, dto.publicKey, dto.label);
  }

  @ApiOperation({ summary: 'Fund a wallet via Stellar friendbot' })
  @ApiResponse({ status: 200, description: 'Wallet funded successfully', type: FundWalletResponseDto })
  @ApiResponse({ status: 400, description: 'Friendbot only available on testnet' })
  @Post('fund')
  fund(@CurrentUser() user: any, @Body() dto: UpsertWalletDto) {
    return this.wallet.fund(user.id, dto.publicKey);
  }

  @ApiOperation({ summary: 'Set a wallet as default' })
  @ApiResponse({ status: 200, description: 'Wallet set as default', type: WalletResponseDto })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @Patch(':id/default')
  setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.setDefault(user.id, id);
  }

  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully', type: WalletSuccessResponseDto })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.wallet.delete(user.id, id);
  }
}
