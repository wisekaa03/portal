/** @format */

// #region Imports NPM
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis, { ReplyError } from 'redis';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
// #endregion

export async function resetSessionStore(store: Session.Store): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    store.clear((error: ReplyError | Error) => {
      if (error) {
        reject(error);
      }
      resolve(true);
    });
  });
}

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
