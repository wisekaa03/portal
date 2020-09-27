/** @format */

//#region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PinoLogger, Logger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { pinoOptions } from '@back/shared/pino.options';
import { AppModule } from './app.module';
//#endregion

async function bootstrap(config: ConfigService): Promise<void> {
  let logger = new Logger(new PinoLogger(pinoOptions()), {});

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger,
    transport: Transport.REDIS,
    options: {
      url: config.get<string>('MICROSERVICE_URL'),
    },
  });

  logger = app.get(Logger);
  const configService = app.get(ConfigService);
  configService.logger = logger;
  app.useLogger(logger);

  await app.listen(() => logger.log('Microservice is listening', 'Sync LDAP'));
}

const configService = new ConfigService(resolve(__dirname, '../../..', '.local/.env'));
bootstrap(configService);
