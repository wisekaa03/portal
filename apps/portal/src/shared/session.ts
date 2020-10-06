/** @format */

//#region Imports NPM
import Session from 'express-session';
import Express from 'express';
import { LoggerService } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

export default (configService: ConfigService, logger: LoggerService, store: Session.Store, secure: boolean): Express.RequestHandler => {
  try {
    // const DEV = configService.get<boolean>('DEVELOPMENT');
    const DEV = true;
    const domain = DEV ? undefined : `.${configService.get<string>('DOMAIN')}`;
    // const httpOnly = !DEV;
    const httpOnly = false;

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
        domain,
        secure,
        // expires: false,
        httpOnly,
        // в миллисекундах, 1000 * 60 - минута
        maxAge: configService.get<number>('SESSION_COOKIE_TTL'),
      },
    });

    return sess;
  } catch (error) {
    logger.error('Redis cannot install', error.toString(), 'Session');

    throw error;
  }
};
