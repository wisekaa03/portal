/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import { ClientRedis } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LDAP_SYNC } from '@back/shared/constants';
import { winstonOptions } from '@back/shared/logger.options';
//#endregion

const configService = new ConfigService(resolve(__dirname, '../../../.local/.env'));
const logger = WinstonModule.createLogger(winstonOptions(configService));

async function bootstrap(config: ConfigService): Promise<boolean> {
  const client = new ClientRedis({
    url: config.get<string>('MICROSERVICE_URL'),
    retryAttempts: 1,
    retryDelay: 100,
    max_attempts: 1,
    connect_timeout: 1000,
    retry_strategy: undefined,
  });

  await client.connect();

  const result = await client.send<boolean>(LDAP_SYNC, []).toPromise();

  client.close();

  return result;
}

bootstrap(configService)
  .then((result) => {
    logger.log({ message: `${LDAP_SYNC.toString()} returns: ${result}`, context: 'Sync LDAP Job', function: 'bootstrap' });
    process.exit((result && 1) || 0);
  })
  .catch((error) => {
    throw new Error(`Sync job: Result: ${JSON.stringify(error)}`);
  });
