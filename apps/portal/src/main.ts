/** @format */

//#region Imports NPM
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
import crypto from 'crypto';
import nextI18NextMiddleware from 'next-i18next/middleware';
import passport from 'passport';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Logger, PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { nextI18next } from '@lib/i18n-client';
import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';
import { AppModule } from '@back/app.module';
import { pinoOptions } from './shared/pino.options';
//#endregion

async function bootstrap(config: ConfigService): Promise<void> {
  let httpsServer: boolean | ServerOptions = false;
  const DEV = configService.get<boolean>('DEVELOPMENT');

  //#region NestJS options
  const logger = new Logger(new PinoLogger(pinoOptions(config.get<string>('LOGLEVEL'), DEV)), {});
  const nestjsOptions: NestApplicationOptions = {
    cors: {
      credentials: true,
    },
    logger,
  };
  //#endregion

  //#region Create NestJS app
  if (
    !!config.get<number>('PORT_SSL') &&
    fs.lstatSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure')).isDirectory()
  ) {
    const secureDirectory = fs.readdirSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure'));
    if (secureDirectory.filter((file) => file.includes('private.key') || file.includes('private.crt')).length > 0) {
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
  //#endregion

  //#region X-Response-Time
  // app.use(responseTime());
  //#endregion

  //#region Improve security
  // app.use(helmet.ieNoOpen());

  const scriptSrc: (string | helmet.IHelmetContentSecurityPolicyDirectiveFunction)[] = ["'self'"];
  const styleSrc: (string | helmet.IHelmetContentSecurityPolicyDirectiveFunction)[] = ["'unsafe-inline'", "'self'"];
  const imgSrc = ["'self'", 'data:', 'blob:'];
  const fontSrc = ["'self'", 'data:'];
  const frameSrc = ["'self'"];
  const defaultSrc = ["'self'"];
  const connectSrc = ["'self'"];

  const mailUrl = config.get<string>('MAIL_URL');
  if (mailUrl.match(/^http/i)) {
    imgSrc.push(mailUrl);
    fontSrc.push(mailUrl);
    frameSrc.push(mailUrl);
    defaultSrc.push(mailUrl);
  }

  const newsUrl = config.get<string>('NEWS_URL');
  if (newsUrl.match(/^http/i)) {
    imgSrc.push(newsUrl);
    fontSrc.push(newsUrl);
    frameSrc.push(newsUrl);
    defaultSrc.push(newsUrl);
  }

  const newsApiUrl = config.get<string>('NEWS_API_URL');
  if (newsApiUrl.match(/^http/i)) {
    imgSrc.push(newsApiUrl);
  }

  const meetingUrl = config.get<string>('MEETING_URL');
  if (meetingUrl.match(/^http/i)) {
    frameSrc.push(meetingUrl);
  }

  scriptSrc.push('https://storage.googleapis.com');

  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (DEV) {
    scriptSrc.push("'unsafe-inline'");
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
    connectSrc.push(`wss://localhost:${config.get<number>('PORT_SSL')}/graphql`);
    connectSrc.push(`ws://localhost:${config.get<number>('PORT')}/graphql`);
  }

  //#region Next.JS locals
  app.use('*', (_request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (!DEV) {
      response.locals.nonce = crypto.randomBytes(4).toString('hex');
    }
    response.locals.nestLogger = logger;
    next();
  });
  //#endregion

  if (!DEV) {
    scriptSrc.push((_request, response) => `'nonce-${response.locals.nonce}'`);
  }

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc,
        objectSrc: ["'none'"],
        imgSrc,
        fontSrc,
        scriptSrc,
        frameSrc,
        styleSrc,
        connectSrc,
        upgradeInsecureRequests: true,
      },
    }),
  );
  //#endregion

  //#region Enable json response
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(bodyParser.json());
  //#endregion

  //#region Enable cookie
  // app.use(cookieParser());
  //#endregion

  //#region Session and passport initialization
  const store = sessionRedis(config, logger);
  app.use(session(config, logger, store));

  app.use(passport.initialize());
  app.use(passport.session());
  //#endregion

  //#region Static files
  app.useStaticAssets(resolve(__dirname, __DEV__ ? '../../..' : '../..', 'public/'));
  //#endregion

  //#region Locale I18n
  app.use(nextI18NextMiddleware(nextI18next));
  //#endregion

  //#region Next
  const appNextjs = Next({
    dev: __DEV__,
    dir: __DEV__ ? 'apps/portal' : '',
    quiet: !DEV,
  });
  await appNextjs.prepare();
  const renderer = app.get(RenderModule);
  renderer.register(app, appNextjs, { dev: __DEV__, viewsDir: '' });
  const service = app.get(RenderService);
  service.setErrorHandler(
    async (
      error: HttpException,
      request: express.Request,
      response: express.Response,
      _pathname: string,
      _query: ParsedUrlQuery,
    ): Promise<void> => {
      let status: number;
      if (error instanceof HttpException) {
        status = error.getStatus();
      } else {
        status = 200;
      }
      if (status === 403 || status === 401) {
        response.status(302);
        response.location(`/auth/login?redirect=${encodeURI(request.url)}`);
      }
    },
  );
  //#endregion

  //#region Start server
  await app.init();

  http.createServer(server).listen(config.get<number>('PORT'));
  logger.log(`HTTP running on port ${config.get('PORT')}`, 'Bootstrap');

  if (httpsServer) {
    https.createServer(httpsServer, server).listen(config.get<number>('PORT_SSL'));
    logger.log(`HTTPS running on port ${config.get('PORT_SSL')}`, 'Bootstrap');
  }
  //#endregion

  //#region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }
  //#endregion
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../..', '.local/.env'));
bootstrap(configService);
