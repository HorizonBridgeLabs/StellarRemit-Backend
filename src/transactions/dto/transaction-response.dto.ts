import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  senderId: string;

  @ApiProperty({ example: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
  recipient: string;

  @ApiProperty({ example: '100.00' })
  amount: number;

  @ApiProperty({ example: '0.001' })
  fee: number;

  @ApiProperty({ example: 'XLM' })
  asset: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiPropertyOptional({ example: 'abc123...' })
  txHash?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;
}

export class TransactionStatusResponseDto {
  @ApiProperty({ example: 'Transaction status updated' })
  message: string;

  @ApiProperty({ example: true })
  updated: boolean;

  @ApiProperty({ example: 'completed' })
  status: string;
}
