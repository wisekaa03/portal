/** @format */

//#region Imports NPM
import fs from 'fs';
import { resolve } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions } from '@nestjs/common';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import crypto from 'crypto';
import passport from 'passport';
import { contentSecurityPolicy } from 'helmet';
import cookieParser from 'cookie-parser';
// import bodyParser from 'body-parser';
import { Logger, PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';
import { AppModule } from '@back/app.module';
import { pinoOptions } from '@back/shared/pino.options';
//#endregion

async function bootstrap(): Promise<void> {
  //#region NestJS options
  let secure = false;
  let logger = new Logger(new PinoLogger(pinoOptions()), {});
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

      // if (__DEV__) {
      //   // eslint-disable-next-line dot-notation
      //   process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
      // }

      secure = true;
      nestjsOptions.httpsOptions = {
        requestCert: false,
        rejectUnauthorized: false,
        key: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.key')),
        cert: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.crt')),
      };
    } else {
      throw new Error('No files');
    }
  } catch (error) {
    logger.warn('There are no files "private.crt", "private.key" in "secure" directory."', error.toString(), 'Bootstrap');
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

  const scriptSrc: string[] = ["'self'", 'https://storage.googleapis.com', 'https://cdnjs.cloudflare.com'];
  const styleSrc: string[] = ["'unsafe-inline'", "'self'"];
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

  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (DEV) {
    scriptSrc.push("'unsafe-inline'");
    scriptSrc.push("'unsafe-eval'");
    scriptSrc.push('http://cdn.jsdelivr.net');
    scriptSrc.push('https://cdn.jsdelivr.net');
    styleSrc.push('https://fonts.googleapis.com');
    styleSrc.push('http://cdn.jsdelivr.net');
    styleSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('https://cdn.jsdelivr.net');
    imgSrc.push('http://cdn.jsdelivr.net');
    fontSrc.push('https://fonts.gstatic.com');
    frameSrc.push(`http://localhost.portal.${configService.get<string>('DOMAIN')}:${configService.get<number>('PORT')}`);
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

  app.use((_req: IncomingMessage, res: ServerResponse, next: () => void) => {
    contentSecurityPolicy({
      directives: {
        defaultSrc,
        objectSrc: ["'none'"],
        imgSrc,
        fontSrc,
        scriptSrc: !DEV ? scriptSrc.concat(`'nonce-${(res as any).locals.nonce}'`) : scriptSrc,
        frameSrc,
        styleSrc,
        connectSrc,
        // TODO: helmet bug ?
        // upgradeInsecureRequests: 'true',
      },
    })(_req, res, next);
  });
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
