/** @format */

// #region Imports NPM
import Session from 'express-session';
import Express from 'express';
// #endreion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
// #endregion

export default (configService: ConfigService, logService: LogService, store: Session.Store): Express.RequestHandler => {
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
      name: 'portal',
      // genid: () => genuuid(),
      cookie: {
        path: '/',
        // domain: '',
        // secure: process.env.PROTOCOL === 'https',
        // expires: false,
        httpOnly: false,
        // в миллисекундах, 1000 * 60 - минута
        maxAge: configService.get<number>('SESSION_COOKIE_TTL'),
      },
    });

    logService.debug('ok', 'Session');

    return sess;
  } catch (error) {
    logService.error('cannot install', error.toString(), 'Session');

    throw error;
  }
};
