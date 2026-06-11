import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.config';

function validateEnv() {
  const config = plainToInstance(EnvConfig, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length > 0) {
    const missingVars: string[] = [];
    for (const error of errors) {
      const constraints = error.constraints ?? {};
      const messages = Object.values(constraints);
      missingVars.push(`  - ${error.property}: ${messages.join(', ')}`);
    }
    throw new Error(`Environment validation failed - missing or invalid variables:\n${missingVars.join('\n')}`);
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
