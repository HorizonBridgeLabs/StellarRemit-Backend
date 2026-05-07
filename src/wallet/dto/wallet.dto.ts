import { IsString, IsNotEmpty } from 'class-validator';

export class UpsertWalletDto {
  @IsString()
  @IsNotEmpty()
  publicKey: string;
}
