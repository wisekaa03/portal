/** @format */

// #region Imports NPM
// import { IncomingMessage } from 'http';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import passport from 'passport';
import responseTime from 'response-time';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import morgan from 'morgan';
// #endregion
// #region Imports Local
import { sessionRedis } from './shared/session-redis';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LogService } from './logger/logger.service';
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

  // #region Morgan: request/response logging
  app.use(morgan('tiny', { stream: logger }));
  // #endregion

  // #region X-Response-Time
  app.use(responseTime());
  // #endregion

  // #region improve security
  app.use(helmet());
  // #endregion

  // #region improve performance - this is done by Nginx reverse-proxy, do not need
  // app.use(compression());
  // #endregion

  // #region enable json response
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // #endregion

  // #region enable cookie
  // app.use(cookieParser());
  // #endregion

  // #region production ready session store
  app.use(sessionRedis(configService));
  // #endregion

  // #region Passport initialization
  app.use(passport.initialize());

  // eslint-disable-next-line no-debugger
  debugger;

  const session = passport.session();

  app.use(session);
  // #endregion

  // #region Static files
  app.useStaticAssets(join(__dirname, '..', 'static'));
  // #endregion

  // #region start server
  await app.listen(configService.get('PORT'), configService.get('HOST'));
  logger.log(`Server running on ${configService.get('HOST')}:${configService.get('PORT')}`, 'Bootstrap');
  // #endregion
}

const configService = new ConfigService(join(process.cwd(), '.env'));
bootstrap(configService);
