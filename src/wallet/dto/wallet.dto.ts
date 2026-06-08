import { IsString, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { StrKey } from 'stellar-sdk';

@ValidatorConstraint({ name: 'isStellarPublicKey', async: false })
export class IsStellarPublicKeyConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    return StrKey.isValidEd25519PublicKey(value);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'publicKey must be a valid Stellar public key (must start with "G" and be 56 characters)';
  }
}

export class UpsertWalletDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsStellarPublicKeyConstraint)
  publicKey: string;
}

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsStellarPublicKeyConstraint)
  publicKey: string;

  @IsOptional()
  @IsString()
  label?: string;
}
