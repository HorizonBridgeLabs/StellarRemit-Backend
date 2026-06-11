import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsIn, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { IsStellarPublicKeyConstraint } from '../../wallet/dto/wallet.dto';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsStellarPublicKeyConstraint)
  recipient: string;

  @IsNumber()
  @Min(0.0000001)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fee?: number;

  @IsOptional()
  @IsString()
  @IsIn(['XLM'])
  asset?: string;
}
