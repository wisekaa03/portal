/** @format */

// #region Imports NPM
// import { IncomingMessage } from 'http';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { Request, Response } from 'express';
import uuidv4 from 'uuid/v4';
import nextI18NextMiddleware from 'next-i18next/middleware';
import passport from 'passport';
import responseTime from 'response-time';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// #endregion
// #region Imports Local
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LogService } from './logger/logger.service';
import { nextI18next } from '../lib/i18n-client';
// #endregion

// #region NestJS options
const logger = new LogService();
const nestjsOptions: NestApplicationOptions = {
  cors: {
    credentials: true,
  },
  logger,
  // httpsOptions: {},
};
// #endregion

async function bootstrap(configService: ConfigService): Promise<void> {
  // #region create NestJS server
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, nestjsOptions);
  app.useLogger(logger);
  // #endregion

  // #region X-Response-Time
  app.use(responseTime());
  // #endregion

  // #region improve security - this is done by Nginx reverse-proxy, do not need
  app.use(helmet.ieNoOpen());
  app.use('*', (req: Request, res: Response, next: Function) => {
    res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
    next();
  });

  // TODO: Как сделать nonce ?
  // const nonce = (req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;
  const scriptSrc = ["'self'", "'unsafe-inline'" /* , nonce */];
  const styleSrc = ["'unsafe-inline'", "'self'"];
  const imgSrc = ["'self'", 'data:'];
  const fontSrc = ["'self'", 'data:', 'https://i-npz.ru'];
  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (process.env.NODE_ENV !== 'production') {
    scriptSrc.push("'unsafe-eval'");
    scriptSrc.push('https://cdn.jsdelivr.net');
    styleSrc.push('https://fonts.googleapis.com');
    styleSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('http://cdn.jsdelivr.net');
    fontSrc.push('https://fonts.gstatic.com');
  }

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'none'"],
        objectSrc: ["'none'"],
        imgSrc,
        fontSrc,
        scriptSrc,
        frameSrc: ["'self'", 'https://i-npz.ru'],
        styleSrc,
        upgradeInsecureRequests: true,
      },
    }),
  );

  app.use(helmet.hidePoweredBy());
  // #endregion

  // #region improve performance - this is done by Nginx reverse-proxy, do not need
  // app.use(compression());
  // #endregion

  // #region enable json response
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // #endregion

  // #region enable cookie
  app.use(cookieParser());
  // #endregion

  // #region Passport initialization
  app.use(passport.initialize());
  // #endregion

  // #region Static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // #endregion

  // #region Locale I18n
  app.use(nextI18NextMiddleware(nextI18next));
  // #endregion

  // #region start server
  await app.listen(configService.get('PORT'), configService.get('HOST'));
  logger.log(`Server running on ${configService.get('HOST')}:${configService.get('PORT')}`, 'Bootstrap');
  // #endregion
}

const configService = new ConfigService(join(process.cwd(), '.env'));
bootstrap(configService);
