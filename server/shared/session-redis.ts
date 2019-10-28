/** @format */

// #region Imports NPM
import session from 'express-session';
import redisSessionStore from 'connect-redis';
import redis from 'redis';
// #endreion
// #region Imports Local
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
// #endregion

export default (configService: ConfigService, logService: LogService): any => {
  const sess = session({
    secret: configService.get<string>('SESSION_SECRET'),
    store: new (redisSessionStore(session))({
      client: redis.createClient({
        host: configService.get<string>('SESSION_REDIS_HOST'),
        port: configService.get<number>('SESSION_REDIS_PORT'),
        db: configService.get<number>('SESSION_REDIS_DB'),
        password: configService.get<string>('SESSION_REDIS_PASSWORD'),
      }),
    }),
    resave: false,
    // rolling: true,
    saveUninitialized: false,
    name: 'portal',
    // genid: () => genuuid(),
    cookie: {
      path: '/',
      // domain: '',
      // secure: process.env.PROTOCOL === 'https',
      // expires: false,
      httpOnly: false,
      maxAge: configService.get<number>('SESSION_COOKIE_TTL'), // msec, 1 hour
    },
  });

  if (sess) {
    logService.debug(
      `install session cache: ` +
        `host="${configService.get<string>('SESSION_REDIS_HOST')}" ` +
        `port="${configService.get<number>('SESSION_REDIS_PORT')}" ` +
        `db="${configService.get<number>('SESSION_REDIS_DB')}" ` +
        `cookie ttl="${configService.get<number>('SESSION_COOKIE_TTL')}" ` +
        `secret="${configService.get<string>('SESSION_SECRET') ? '{MASKED}' : ''}" ` +
        `password="${configService.get<string>('SESSION_PASSWORD') ? '{MASKED}' : ''}"`,
      'Session',
    );

    return sess;
  }

  return null;
};
