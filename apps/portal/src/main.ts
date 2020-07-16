/** @format */

//#region Imports NPM
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
// import bodyParser from 'body-parser';
import { Logger, PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { nextI18next } from '@lib/i18n-client';
import getRedirect from '@lib/get-redirect';
import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';
import { AppModule } from '@back/app.module';
import { pinoOptions } from './shared/pino.options';
//#endregion

async function bootstrap(): Promise<void> {
  //#region NestJS options
  let secure = false;
  let logger = new Logger(new PinoLogger(pinoOptions('debug', true)), {});
  const nestjsOptions: NestApplicationOptions = {
    cors: {
      credentials: true,
    },
    logger,
  };
  //#endregion

  //#region Create NestJS app
  try {
    fs.lstatSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure')).isDirectory();

    const secureDirectory = fs.readdirSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure'));
    if (secureDirectory.filter((file) => file.includes('private.key') || file.includes('private.crt')).length > 0) {
      logger.log('Using HTTPS certificate', 'Bootstrap');

      if (__DEV__) {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
      }

      secure = true;
      nestjsOptions['httpsOptions'] = {
        requestCert: false,
        rejectUnauthorized: false,
        key: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.key')),
        cert: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.crt')),
      };
    } else {
      throw new Error('No files');
    }
    // eslint-disable-next-line no-empty
  } catch (error) {
    logger.error(
      'There are no files "private.crt", "private.key" in "secure" directory."',
      error.toString(),
      'Bootstrap',
    );
  }
  const server = express();
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    nestjsOptions,
  );

  logger = app.get(Logger);
  const configService = app.get(ConfigService);
  configService.logger = logger;
  configService.secure = secure;
  const DEV = configService.get<boolean>('DEVELOPMENT');

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

  const mailUrl = configService.get<string>('MAIL_URL');
  if (mailUrl.match(/^http/i)) {
    imgSrc.push(mailUrl);
    fontSrc.push(mailUrl);
    frameSrc.push(mailUrl);
    defaultSrc.push(mailUrl);
  }

  const newsUrl = configService.get<string>('NEWS_URL');
  if (newsUrl.match(/^http/i)) {
    imgSrc.push(newsUrl);
    fontSrc.push(newsUrl);
    frameSrc.push(newsUrl);
    defaultSrc.push(newsUrl);
  }

  const newsApiUrl = configService.get<string>('NEWS_API_URL');
  if (newsApiUrl.match(/^http/i)) {
    imgSrc.push(newsApiUrl);
  }

  const meetingUrl = configService.get<string>('MEETING_URL');
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
    frameSrc.push(
      `http://localhost.portal.${configService.get<string>('DOMAIN')}:${configService.get<number>('PORT')}`,
    );
    frameSrc.push(`http://localhost:${configService.get<number>('PORT')}`);
    connectSrc.push(`ws://localhost:${configService.get<number>('PORT')}/graphql`);
  }

  //#region Next.JS locals
  app.use('*', (_request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (!DEV) {
      response.locals.nonce = crypto.randomBytes(4).toString('hex');
    }
    response.locals.config = configService;
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
  app.use(cookieParser());
  //#endregion

  //#region Session and passport initialization
  const store = sessionRedis(configService, logger);
  app.use(session(configService, logger, store, secure));

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
  // const service = app.get(RenderService);
  // service.setErrorHandler(
  //   async (
  //     error: HttpException,
  //     request: express.Request,
  //     response: express.Response,
  //     _pathname: string,
  //     _query: ParsedUrlQuery,
  //   ): Promise<void> => {
  //     let status: number;
  //     if (error instanceof HttpException) {
  //       status = error.getStatus();
  //       if (status >= 401 && status <= 403) {
  //         response.status(302);
  //         response.location(`/auth/login?redirect=${getRedirect(request.url)}`);
  //       }
  //     }
  //   },
  // );
  //#endregion

  //#region Start server
  await app.listen(configService.get<number>('PORT'));
  logger.log(`HTTP${secure ? 'S' : ''} running on port ${configService.get<number>('PORT')}`, 'Bootstrap');
  //#endregion

  //#region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }
  //#endregion
}

bootstrap();
