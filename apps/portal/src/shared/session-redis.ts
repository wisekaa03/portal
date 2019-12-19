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

    logService.debug(
      'redis: ' +
        `url="${configService.get<string>('SESSION_REDIS_URI')}", ` +
        `cookie ttl=${configService.get<number>('SESSION_COOKIE_TTL')}ms, ` +
        `secret="${configService.get<string>('SESSION_SECRET') ? '{MASKED}' : ''}" `,
      'Session',
    );

    return sess;
  } catch (error) {
    logService.error('Error when installing', error.toString(), 'Session');

    throw error;
  }
};
