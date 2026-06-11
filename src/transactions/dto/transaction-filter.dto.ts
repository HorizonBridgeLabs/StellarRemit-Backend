import { IsOptional, IsString, IsIn, IsISO8601 } from 'class-validator';

export class TransactionFilterDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @IsOptional()
  @IsISO8601()
  toDate?: string;

  @IsOptional()
  @IsString()
  asset?: string;
}
