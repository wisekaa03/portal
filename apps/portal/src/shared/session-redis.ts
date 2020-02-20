/** @format */

// #region Imports NPM
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
// #endregion

export default (configService: ConfigService, logService: LogService): Session.Store => {
  try {
    const sess = new (RedisSessionStore(Session))({
      client: Redis.createClient({
        url: configService.get<string>('SESSION_REDIS_URI'),
      }),
    });

    logService.debug(`Redis: url="${configService.get<string>('SESSION_REDIS_URI')}"`, 'Session');

    return sess;
  } catch (error) {
    logService.error('Error when installing', error.toString(), 'Session');

    throw error;
  }
};
