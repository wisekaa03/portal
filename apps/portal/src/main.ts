/** @format */

// #region Imports NPM
import http from 'http';
import https, { ServerOptions } from 'https';
import fs from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, HttpException } from '@nestjs/common';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { RenderService, RenderModule } from 'nest-next';
import { ParsedUrlQuery } from 'querystring';
import Next from 'next';
// import { v4 as uuidv4 } from 'uuid';
import nextI18NextMiddleware from 'next-i18next/middleware';
import passport from 'passport';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { nextI18next } from '@lib/i18n-client';
import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';
import { AppModule } from '@back/app.module';
import { pinoOptions } from './shared/pino.options';
// #endregion

async function bootstrap(config: ConfigService): Promise<void> {
  let httpsServer: boolean | ServerOptions = false;

  // #region NestJS options
  const logger: LogService = new LogService(new PinoLogger(pinoOptions(config.get<string>('LOGLEVEL'))), {});
  const nestjsOptions: NestApplicationOptions = {
    cors: {
      credentials: true,
    },
    logger,
  };
  // #endregion

  // #region Create NestJS app
  if (fs.lstatSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure')).isDirectory()) {
    const secureDir = fs.readdirSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure'));
    if (secureDir.filter((file) => file.includes('private.key') || file.includes('private.crt')).length > 0) {
      logger.log('Using HTTPS certificate', 'Bootstrap');

      httpsServer = {
        requestCert: false,
        rejectUnauthorized: false,
        key: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.key')),
        cert: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.crt')),
      };
    } else {
      logger.error(
        'There are not enough files "private.crt" and "private.key" in "secure" directory."',
        undefined,
        'Bootstrap',
      );
    }
  }
  const server = express();
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    nestjsOptions,
  );
  app.useLogger(logger);
  // #endregion

  // #region X-Response-Time
  // app.use(responseTime());
  // #endregion

  // #region Improve security
  // app.use(helmet.ieNoOpen());

  // TODO: Как сделать nonce ?
  // const nonce = (req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;

  const scriptSrc = ["'self'", "'unsafe-inline'" /* , nonce */];
  const styleSrc = ["'unsafe-inline'", "'self'"];
  const imgSrc = ["'self'", 'data:', 'blob:'];
  const fontSrc = ["'self'", 'data:'];
  const frameSrc = ["'self'"];
  const defaultSrc = ["'self'"];

  const mailUrl = config.get<string>('MAIL_URL');
  if (mailUrl.match(/http/)) {
    imgSrc.push(mailUrl);
    fontSrc.push(mailUrl);
    frameSrc.push(mailUrl);
    defaultSrc.push(mailUrl);
  }

  const newsUrl = config.get<string>('NEWS_URL');
  if (newsUrl.match(/http/)) {
    imgSrc.push(newsUrl);
    fontSrc.push(newsUrl);
    frameSrc.push(newsUrl);
    defaultSrc.push(newsUrl);
  }

  const newsApiUrl = config.get<string>('NEWS_API_URL');
  if (newsApiUrl.match(/http/)) {
    imgSrc.push(newsApiUrl);
  }

  const meetingUrl = config.get<string>('MEETING_URL');
  if (meetingUrl.match(/http/)) {
    frameSrc.push(meetingUrl);
  }

  scriptSrc.push('https://storage.googleapis.com');

  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (__DEV__) {
    scriptSrc.push("'unsafe-eval'");
    scriptSrc.push('https://cdn.jsdelivr.net');
    styleSrc.push('https://fonts.googleapis.com');
    styleSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('http://cdn.jsdelivr.net');
    fontSrc.push('https://fonts.gstatic.com');
    frameSrc.push(`https://localhost.portal.${config.get<string>('DOMAIN')}:${config.get<number>('PORT_SSL')}`);
    frameSrc.push(`http://localhost.portal.${config.get<string>('DOMAIN')}:${config.get<number>('PORT')}`);
    frameSrc.push(`https://localhost:${config.get<number>('PORT_SSL')}`);
    frameSrc.push(`http://localhost:${config.get<number>('PORT')}`);
  }

  app.use(
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
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // #endregion

  // #region Enable cookie
  app.use(cookieParser());
  // #endregion

  // #region Session and passport initialization
  const store = sessionRedis(config, logger);
  app.use(session(config, logger, store));

  app.use(passport.initialize());
  app.use(passport.session());
  // #endregion

  // #region Static files
  app.useStaticAssets(resolve(__dirname, __DEV__ ? '../../..' : '../..', 'public/'));
  // #endregion

  // #region Locale I18n
  app.use(nextI18NextMiddleware(nextI18next));
  // #endregion

  // #region Next.JS locals
  app.use('*', (_req: Request, res: express.Response, next: Function) => {
    // res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
    res.locals.nestLogger = logger;
    next();
    // res.set('X-Server-ID', res);
    // res.removeHeader('X-Powered-By');
  });
  // #endregion

  // #region Next
  const appNextjs = Next({
    dev: __DEV__,
    dir: __DEV__ ? 'apps/portal' : '',
    quiet: false,
  });
  await appNextjs.prepare();
  const renderer = app.get(RenderModule);
  renderer.register(app, appNextjs, { dev: __DEV__, viewsDir: '' });
  const service = app.get(RenderService);
  service.setErrorHandler(
    async (
      err: HttpException,
      req: express.Request,
      res: express.Response,
      _pathname: any,
      _query: ParsedUrlQuery,
    ): Promise<any> => {
      const status = err.getStatus();
      if (status === 403 || status === 401) {
        res.status(302);
        res.location(`/auth/login?redirect=${encodeURI(req.url)}`);
      }
    },
  );
  // #endregion

  // #region Start server
  await app.init();

  http.createServer(server).listen(config.get<number>('PORT'));
  logger.log(`HTTP running on port ${config.get('PORT')}`, 'Bootstrap');

  if (httpsServer) {
    https.createServer(httpsServer, server).listen(config.get<number>('PORT_SSL'));
    logger.log(`HTTPS running on port ${config.get('PORT_SSL')}`, 'Bootstrap');
  }
  // #endregion

  // #region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }
  // #endregion
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../..', '.env'));
bootstrap(configService);
