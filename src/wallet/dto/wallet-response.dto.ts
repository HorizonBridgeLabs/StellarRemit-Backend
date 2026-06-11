import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
  publicKey: string;

  @ApiPropertyOptional({ example: 'My Wallet' })
  label?: string;

  @ApiProperty({ example: true })
  isDefault: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;
}

export class BalanceLineDto {
  @ApiProperty({ example: 'native' })
  asset_type: string;

  @ApiPropertyOptional({ example: 'USDC' })
  asset_code?: string;

  @ApiPropertyOptional({ example: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
  asset_issuer?: string;

  @ApiProperty({ example: '1000.0000000' })
  balance: string;
}

export class WalletBalanceResponseDto {
  @ApiProperty({ type: [BalanceLineDto] })
  balances: BalanceLineDto[];
}

export class TotalBalanceResponseDto {
  @ApiProperty({ example: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
  publicKey: string;

  @ApiPropertyOptional({ example: 'My Wallet' })
  label?: string;

  @ApiProperty({ type: [BalanceLineDto] })
  balances: BalanceLineDto[];
}

export class WalletWithBalancesResponseDto {
  @ApiProperty({ type: [TotalBalanceResponseDto] })
  wallets: TotalBalanceResponseDto[];
}

export class FriendbotResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
  address: string;
}

export class FundWalletResponseDto {
  @ApiProperty({ type: WalletResponseDto })
  wallet: WalletResponseDto;

  @ApiProperty({ type: FriendbotResponseDto })
  friendbot: FriendbotResponseDto;
}

export class WalletSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
