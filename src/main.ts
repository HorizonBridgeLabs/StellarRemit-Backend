import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

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
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(helmet());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StellarRemit API')
    .setDescription('Production-ready NestJS API for a Stellar-based remittance platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on port ${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at /api/docs`);
}
bootstrap();
