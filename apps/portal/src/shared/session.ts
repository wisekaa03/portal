/** @format */

//#region Imports NPM
import Session from 'express-session';
import Express from 'express';
import { Logger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

export default (configService: ConfigService, logger: Logger, store: Session.Store): Express.RequestHandler => {
  try {
    const sess = Session({
      secret: configService.get<string>('SESSION_SECRET'),
      store,
      // resave:
      // Save the session to store even if it hasn't changed
      resave: false,
      // rolling:
      // Force the session identifier cookie to be set on every response.
      // The expiration is reset to the original maxAge, resetting the expiration countdown.
      // Reset the cookie Max-Age on every request
      rolling: true,
      // Don't create a session for anonymous users
      saveUninitialized: false,
      name: configService.get<string>('SESSION_NAME'),
      // genid: () => genuuid(),
      cookie: {
        path: '/',
        domain: `.${configService.get<string>('DOMAIN')}`,
        // secure: process.env.PROTOCOL === 'https',
        // expires: false,
        httpOnly: false,
        // в миллисекундах, 1000 * 60 - минута
        maxAge: configService.get<number>('SESSION_COOKIE_TTL'),
      },
    });

    logger.debug('Redis connection: success', 'Session');

    return sess;
  } catch (error) {
    logger.error('cannot install', error, 'Session');

    throw error;
  }
};
