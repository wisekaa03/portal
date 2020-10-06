/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import { ClientRedis } from '@nestjs/microservices';
import { createLogger } from 'winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LDAP_SYNC } from '@back/shared/constants';
import { winstonOptions } from '@back/shared/logger.options';
//#endregion

const configService = new ConfigService(resolve(__dirname, '../../..', '.local/.env'));
const logger = createLogger(winstonOptions());

async function bootstrap(config: ConfigService): Promise<boolean> {
  const client = new ClientRedis({
    url: config.get<string>('MICROSERVICE_URL'),
  });

  await client.connect();

  return client.send<boolean>(LDAP_SYNC, []).toPromise();
}

bootstrap(configService)
  .then((result) => {
    logger.log(`Microservice returns: ${result}`, 'Sync LDAP Job');
  })
  .catch((error) => {
    throw new Error(`Synch job: Result: ${JSON.stringify(error)}`);
  });
