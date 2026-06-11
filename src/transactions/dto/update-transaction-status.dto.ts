import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateTransactionStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'completed', 'failed', 'cancelled'])
  status: string;
}
