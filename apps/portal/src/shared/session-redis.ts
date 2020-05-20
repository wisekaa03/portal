/** @format */

//#region Imports NPM
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'redis';
import { Logger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

export default (configService: ConfigService, logger: Logger): Session.Store => {
  try {
    const sess = new (RedisSessionStore(Session))({
      client: Redis.createClient({
        url: configService.get<string>('SESSION_REDIS_URI'),
      }),
    });

    logger.debug(`Redis: url="${configService.get<string>('SESSION_REDIS_URI')}"`, 'Session');

    return sess;
  } catch (error) {
    logger.error('Error when installing', error, 'Session');

    throw error;
  }
};
