/** @format */

//#region Imports NPM
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { winstonOptions } from '@back/shared/logger.options';
import { AppModule } from './app.module';
//#endregion

async function bootstrap(config: ConfigService): Promise<void> {
  const loggerBootstrap = WinstonModule.createLogger(winstonOptions(config));

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: loggerBootstrap,
    transport: Transport.REDIS,
    options: {
      url: config.get<string>('MICROSERVICE_URL'),
    },
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(ConfigService);
  configService.logger = logger;
  app.useLogger(logger);

  await app.listen(() => loggerBootstrap.verbose!({ message: 'Microservice is listening', context: 'Sync LDAP', function: 'bootstrap' }));
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../../..', '.local/.env'));
bootstrap(configService);
