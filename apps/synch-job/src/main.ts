/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { ClientRedis } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { SYNCHRONIZATION } from '../../synch/src/app.constants';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<boolean> {
  const client = new ClientRedis({
    url: configService.get<string>('MICROSERVICE_URL'),
  });

  await client.connect();

  return client.send<boolean>(SYNCHRONIZATION, []).toPromise();
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../../..', '.env'));
bootstrap(configService)
  .then((result) => logger.log(`Result: ${result}`, 'Synch job'))
  .catch((error) => {
    logger.error(`Result: ${JSON.stringify(error)}`, 'Synch job');
  });
