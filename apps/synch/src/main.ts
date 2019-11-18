/** @format */

// #region Imports NPM
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/common/enums/transport.enum';
import { AppModule } from './app.module';
// #endregion
// #region Imports Local
import { ConfigService } from '../../portal/src/config/config.service';
import { LogService } from '../../portal/src/logger/logger.service';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<void> {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: {
      url: configService.get<string>('MICROSERVICE_URL'),
      user: configService.get<string>('MICROSERVICE_USER'),
      pass: configService.get<string>('MICROSERVICE_PASS'),
    },
  });

  await app.listen(() => logger.log('Microservice is listening'));
}

const configService = new ConfigService(dev ? `${__dirname}/../../../.env` : `${__dirname}/../../.env`);
bootstrap(configService);
