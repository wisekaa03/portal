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

const configService = new ConfigService(resolve(__dirname, '../../..', '.local/.env'));
const logger = WinstonModule.createLogger(winstonOptions(configService));

async function bootstrap(config: ConfigService): Promise<boolean> {
  const client = new ClientRedis({
    url: config.get<string>('MICROSERVICE_URL'),
  });

  await client.connect();

  return client.send<boolean>(LDAP_SYNC, []).toPromise();
}

bootstrap(configService)
  .then((result) => {
    logger.verbose!({ message: `Microservice returns: ${result}`, context: 'Sync LDAP Job', function: 'bootstrap' });
  })
  .catch((error) => {
    throw new Error(`Synch job: Result: ${JSON.stringify(error)}`);
  });
