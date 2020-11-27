/** @format */

//#region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { winstonOptions } from '@back/shared/logger.options';
import { AppModule } from './app.module';
//#endregion

async function bootstrap(config: ConfigService): Promise<void> {
  const logger = WinstonModule.createLogger(winstonOptions(config));

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger,
    transport: Transport.REDIS,
    options: {
      url: config.get<string>('MICROSERVICE_URL'),
    },
  });

  const configService = app.get(ConfigService);
  configService.logger = logger;
  app.useLogger(logger);

  app.enableShutdownHooks();

  await app.listen(() => logger.log({ message: 'Microservice is listening', context: 'Sync LDAP', function: 'bootstrap' }));
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../../..', '.local/.env'));
bootstrap(configService);
