/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { AppModule } from './app.module';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<void> {
  const server = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger,
    transport: Transport.REDIS,
    options: {
      url: configService.get<string>('MICROSERVICE_URL'),
    },
  });
  server.useLogger(logger);

  await server.listen(() => logger.log('Microservice is listening', 'Sync LDAP'));
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../../..', '.env'));
bootstrap(configService);
