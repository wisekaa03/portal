/** @format */

// #region Imports NPM
// import { IncomingMessage } from 'http';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid';
import nextI18NextMiddleware from 'next-i18next/middleware';
import passport from 'passport';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { HttpException } from '@nestjs/common';
import { RenderModule, RenderService } from 'nest-next-2';
import Next from 'next';
import 'reflect-metadata';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { AppModule } from './app.module';
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
  const app = Next({
    dev,
    dir: resolve(__dirname, dev ? '../../../apps/portal' : '../..'),
    quiet: false,
  });
  await app.prepare();
  // #endregion

  // #region Create NestJS server
  const server: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, nestjsOptions);
  server.useLogger(logger);
  // #endregion

  // #region Next Render
  const renderer = server.get(RenderModule);
  renderer.register(server, app, { dev, viewsDir: '' });
  const service = server.get(RenderService);
  service.setErrorHandler(async (err: HttpException, req: Request, res: Response) => {
    const status = err.getStatus();
    if (status === 403 || status === 401) {
      res.status(302);
      res.location(`/auth/login?redirect=${encodeURI(req.url)}`);
    }
  });
  // #endregion

  // #region X-Response-Time
  // server.use(responseTime());
  // #endregion

  // #region Improve security
  // server.use(helmet.ieNoOpen());

  // TODO: Как сделать nonce ?
  // const nonce = (req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;

  const scriptSrc = ["'self'", "'unsafe-inline'" /* , nonce */];
  const styleSrc = ["'unsafe-inline'", "'self'"];
  const imgSrc = ["'self'", 'data:', 'blob:'];
  const fontSrc = ["'self'", 'data:'];
  const frameSrc = ["'self'"];
  const defaultSrc = ["'self'"];

  const mailUrl = configService.get<string>('MAIL_URL');
  if (mailUrl.match(/http/)) {
    imgSrc.push(mailUrl);
    fontSrc.push(mailUrl);
    frameSrc.push(mailUrl);
    defaultSrc.push(mailUrl);
  }

  const newsUrl = configService.get<string>('NEWS_URL');
  if (newsUrl.match(/http/)) {
    imgSrc.push(newsUrl);
    fontSrc.push(newsUrl);
    frameSrc.push(newsUrl);
    defaultSrc.push(newsUrl);
  }

  const newsApiUrl = configService.get<string>('NEWS_API_URL');
  if (newsApiUrl.match(/http/)) {
    imgSrc.push(newsApiUrl);
  }

  const meetingUrl = configService.get<string>('MEETING_URL');
  if (meetingUrl.match(/http/)) {
    frameSrc.push(meetingUrl);
  }

  scriptSrc.push('https://storage.googleapis.com');

  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (process.env.NODE_ENV !== 'production') {
    scriptSrc.push("'unsafe-eval'");
    scriptSrc.push('https://cdn.jsdelivr.net');
    styleSrc.push('https://fonts.googleapis.com');
    styleSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('http://cdn.jsdelivr.net');
    fontSrc.push('https://fonts.gstatic.com');
    frameSrc.push('http://localhost:4000');
  }

  server.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc,
        // TODO: production != development, will consider this
        // baseUri: ["'none'"],
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
  server.useStaticAssets(resolve(__dirname, dev ? '../../..' : '../..', 'public/'));
  // #endregion

  // #region Locale I18n
  server.use(nextI18NextMiddleware(nextI18next));
  // #endregion

  // #region Next.JS locals
  server.use('*', (_req: Request, res: Response, next: Function) => {
    // res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
    next();
    // res.set('X-Server-ID', res);
    res.removeHeader('X-Powered-By');
  });
  // #endregion

  // #region Start server
  await server.listen(configService.get('PORT'));
  logger.log(`Server running on port ${configService.get('PORT')}`, 'Bootstrap');
  // #endregion

  // #region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => server.close());
  }
  // #endregion
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../..', '.env'));
bootstrap(configService);
