/** @format */

//#region Imports NPM
import { URL } from 'url';
import { LoggerService } from '@nestjs/common';
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'ioredis';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

export default (configService: ConfigService, logger: LoggerService): Session.Store => {
  const redisArray = new URL(configService.get<string>('SESSION_REDIS_URI'));

  if (redisArray && (redisArray.protocol === 'redis:' || redisArray.protocol === 'rediss:')) {
    const { username, password } = redisArray;
    const db = parseInt(redisArray.pathname?.slice(1) || '0', 10);

    try {
      const sess = new (RedisSessionStore(Session))({
        client: new Redis(parseInt(redisArray.port || '6379', 10), redisArray.hostname || 'localhost', {
          username,
          password,
          db,
          keyPrefix: 'SESSION:',
        }),
      });

      return sess;
    } catch (error) {
      logger.error('Error when installing', error.toString(), 'Session');

      throw error;
    }
  }

  logger.error('Unknown error when installing', undefined, 'Session');

  throw new Error();
};
