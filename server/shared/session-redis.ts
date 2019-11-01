/** @format */

// #region Imports NPM
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
// #endregion

export default (configService: ConfigService, logService: LogService): Session.Store => {
  try {
    const sess = new (RedisSessionStore(Session))({
      client: Redis.createClient({
        host: configService.get<string>('SESSION_REDIS_HOST'),
        port: configService.get<number>('SESSION_REDIS_PORT'),
        db: configService.get<number>('SESSION_REDIS_DB'),
        password: configService.get<string>('SESSION_REDIS_PASSWORD') || undefined,
        prefix: configService.get<string>('SESSION_REDIS_PREFIX') || 'SESSION',
      }),
    });

    logService.debug(
      'redis: ' +
        `host="${configService.get<string>('SESSION_REDIS_HOST')}" ` +
        `port="${configService.get<number>('SESSION_REDIS_PORT')}" ` +
        `db="${configService.get<number>('SESSION_REDIS_DB')}" ` +
        `cookie ttl="${configService.get<number>('SESSION_COOKIE_TTL')}" ` +
        `secret="${configService.get<string>('SESSION_SECRET') ? '{MASKED}' : ''}" ` +
        `password="${configService.get<string>('SESSION_REDIS_PASSWORD') ? '{MASKED}' : ''}" ` +
        `prefix="${configService.get<string>('SESSION_REDIS_PREFIX') || 'SESSION'}"`,
      'Session',
    );

    return sess;
  } catch (error) {
    logService.error('Error when installing', error.toString(), 'Session');

    throw error;
  }
};
