/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PinoLogger, Logger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { pinoOptions } from '@back/shared/pino.options';
import { AppModule } from './app.module';
// #endregion

async function bootstrap(config: ConfigService): Promise<void> {
  const logger = new Logger(new PinoLogger(pinoOptions(config.get<string>('LOGLEVEL'))), {});

  const server = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger,
    transport: Transport.REDIS,
    options: {
      url: config.get<string>('MICROSERVICE_URL'),
    },
  });
  server.useLogger(logger);

  await server.listen(() => logger.log('Microservice is listening', 'Sync LDAP'));
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../../..', '.env'));
bootstrap(configService);
