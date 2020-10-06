/** @format */

//#region Imports NPM
import { LoggerService } from '@nestjs/common';
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'redis';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

export default (configService: ConfigService, logger: LoggerService): Session.Store => {
  try {
    const sess = new (RedisSessionStore(Session))({
      client: Redis.createClient({
        url: configService.get<string>('SESSION_REDIS_URI'),
      }),
    });

    return sess;
  } catch (error) {
    logger.error('Error when installing', error.toString(), 'Session');

    throw error;
  }
};
