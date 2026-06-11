import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EnumValidationPipe<T extends Record<string, string>> implements PipeTransform<string, string> {
  constructor(
    private enumObj: T,
    private fieldName: string,
  ) {}

  transform(value: string): string {
    if (!value) return value;
    const validValues = Object.values(this.enumObj);
    if (!validValues.includes(value)) {
      throw new BadRequestException(`${this.fieldName} must be one of: ${validValues.join(', ')}. Received: ${value}`);
    }
    return value;
  }
}
