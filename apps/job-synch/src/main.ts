/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { ClientNats } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { SYNCHRONIZATION } from '../../synch/src/app.constants';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<void> {
  const client = new ClientNats({
    url: configService.get<string>('MICROSERVICE_URL'),
    user: configService.get<string>('MICROSERVICE_USER'),
    pass: configService.get<string>('MICROSERVICE_PASS'),
  });

  await client.connect();

  const result = await client.send<boolean>(SYNCHRONIZATION, []).toPromise();
  logger.log(`Result: ${result}`);
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../../..', '.env'));
bootstrap(configService);
