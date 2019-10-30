/** @format */

// #region Imports NPM
import Session from 'express-session';
import Express from 'express';
// #endreion
// #region Imports Local
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
// #endregion

export default (configService: ConfigService, logService: LogService, store: Session.Store): Express.RequestHandler => {
  try {
    const sess = Session({
      secret: configService.get<string>('SESSION_SECRET'),
      store,
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

    logService.debug('install session ok', 'Session');

    return sess;
  } catch (error) {
    logService.error('cannot install session', error.toString(), 'Session');

    throw error;
  }
};
