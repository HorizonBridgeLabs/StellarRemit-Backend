import { IsString, IsNotEmpty, IsIn, IsPort, ValidateIf } from 'class-validator';

export class EnvConfig {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsPort()
  @ValidateIf((_, v) => v !== undefined)
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsIn(['testnet', 'public'])
  @ValidateIf((_, v) => v !== undefined)
  STELLAR_NETWORK?: string;

  @IsString()
  @IsNotEmpty()
  STELLAR_SECRET_KEY: string;
}
