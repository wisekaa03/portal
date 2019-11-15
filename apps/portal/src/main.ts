/** @format */

// #region Imports NPM
// import { IncomingMessage } from 'http';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
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
// import { getConnection } from 'typeorm';
import { RenderModule } from 'nest-next';
import Next from 'next';
import 'reflect-metadata';
// #endregion
// #region Imports Local
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LogService } from './logger/logger.service';
import { nextI18next } from '../lib/i18n-client';
import sessionRedis from './shared/session-redis';
import session from './shared/session';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

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
  // #region Next
  const app = Next({ dev, quiet: false });
  await app.prepare();
  // #endregion

  // #region Create NestJS server
  const server: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, nestjsOptions);
  server.useLogger(logger);
  // #endregion

  // #region Create Microservices
  // const microservice = server.connectMicroservice({
  //   transport: Transport,
  // });
  // #endregion

  // #region Next Render
  const renderer = server.get(RenderModule);
  renderer.register(server, app, { dev, viewsDir: '' });
  // #endregion

  // #region X-Response-Time
  server.use(responseTime());
  // #endregion

  // #region Improve security
  // server.use(helmet.ieNoOpen());

  // TODO: Как сделать nonce ?
  // const nonce = (req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;
  const scriptSrc = ["'self'", "'unsafe-inline'" /* , nonce */];
  const styleSrc = ["'unsafe-inline'", "'self'"];
  const imgSrc = ["'self'", 'data:'];
  const fontSrc = ["'self'", 'data:', 'https://i-npz.ru'];
  const frameSrc = ["'self'", 'https://i-npz.ru', 'https://roundcube.i-npz.ru'];
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

  server.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'none'"],
        objectSrc: ["'none'"],
        imgSrc,
        fontSrc,
        scriptSrc,
        frameSrc,
        styleSrc,
        upgradeInsecureRequests: true,
      },
    }),
  );

  server.use(helmet.hidePoweredBy());
  // #endregion

  // #region Improve performance - this is done by Nginx reverse-proxy, do not need
  // server.use(compression());
  // #endregion

  // #region Enable json response
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());
  // #endregion

  // #region Enable cookie
  server.use(cookieParser());
  // #endregion

  // #region Session and passport initialization
  const store = sessionRedis(configService, logger);
  server.use(session(configService, logger, store));

  server.use(passport.initialize());
  server.use(passport.session());
  // #endregion

  // #region Static files
  server.useStaticAssets(dev ? `${__dirname}/../../public/` : `${__dirname}/../../public/`);
  // #endregion

  // #region Locale I18n
  server.use(nextI18NextMiddleware(nextI18next));
  // #endregion

  // #region Next.JS locals
  server.use('*', (_req: Request, res: Response, next: Function) => {
    res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
    res.locals.sessionStore = store;
    next();
  });
  // #endregion

  // #region Start server
  await server.listen(configService.get('PORT'), configService.get('HOST'));
  logger.log(`Server running on ${configService.get('HOST')}:${configService.get('PORT')}`, 'Bootstrap');
  // #endregion

  // #region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => server.close());
  }
  // #endregion
}

const configService = new ConfigService(dev ? `${__dirname}/../../.env` : `${__dirname}/../../.env`);
bootstrap(configService);
