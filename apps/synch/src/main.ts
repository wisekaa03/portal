/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/common/enums/transport.enum';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { AppModule } from './app.module';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<void> {
  const server = await NestFactory.createMicroservice(AppModule, {
    logger,
    transport: Transport.NATS,
    options: {
      url: configService.get<string>('MICROSERVICE_URL'),
      user: configService.get<string>('MICROSERVICE_USER'),
      pass: configService.get<string>('MICROSERVICE_PASS'),
    },
  });
  server.useLogger(logger);

  await server.listen(() => logger.log('Microservice is listening', 'Bootstrap'));
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../../..', '.env'));
bootstrap(configService);
