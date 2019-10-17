/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../typings/global" />

// #region Imports NPM
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer, RequestMethod, CacheModule, forwardRef } from '@nestjs/common';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import redisCacheStore from 'cache-manager-redis-store';
// #endregion
// #region Imports Local
import { NextService } from './next/next.service';
import { HttpErrorFilter } from './filters/http-error.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { DateScalar } from './shared/date.scalar';
import { ByteArrayScalar } from './shared/bytearray.scalar';
import { LoggerModule } from './logger/logger.module';
import { LogService } from './logger/logger.service';
import { ConfigModule } from './config/config.module';
import { NextModule } from './next/next.module';
import { HomeModule } from './controllers/controllers.module';
import { NextMiddleware } from './next/next.middleware';
import { NextAssetsMiddleware } from './next/next.assets.middleware';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
// #endregion

@Module({
  imports: [
    // #region Logging module
    LoggerModule,
    // #endregion

    // #region Config module
    ConfigModule,
    // #endregion

    // #region Cache Manager - Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisCacheStore,
        ttl: parseInt(configService.get('REDIS_TTL'), 10), // seconds
        max: parseInt(configService.get('REDIS_MAX_OBJECTS'), 10), // maximum number of items in cache
        host: configService.get('REDIS_HOST'),
        port: parseInt(configService.get('REDIS_PORT'), 10),
        db: configService.get('REDIS_DB') ? parseInt(configService.get('REDIS_DB'), 10) : undefined,
        password: configService.get('REDIS_PASSWORD') ? configService.get('REDIS_PASSWORD') : undefined,
        keyPrefix: configService.get('REDIS_PREFIX') ? configService.get('REDIS_PREFIX') : undefined,
        // retry_strategy: (options) => {}
      }),
    }),
    // #endregion

    // #region Locale I18n
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: configService.i18nPath,
        filePattern: configService.i18nFilePattern,
        fallbackLanguage: configService.fallbackLanguage,
        resolvers: [new QueryResolver(['lang', 'locale', 'l']), new HeaderResolver()],
      }),
    }),
    // #endregion

    // #region GraphQL
    GraphQLModule.forRoot({
      debug: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production',
      typePaths: ['./**/*.graphql'],
      context: ({ req }) => {
        // eslint-disable-next-line no-debugger
        // debugger;

        return { req, user: req._passport.session && req._passport.session.user };
      },
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRoot({}),
    // #endregion

    // #region Profile
    ProfileModule,
    // #endregion

    // #region Users
    forwardRef(() => UserModule),
    // #endregion
    // #region Authentication
    forwardRef(() => AuthModule),
    // #endregion

    // #region Next
    NextModule,
    // #endregion

    // #region Home page
    HomeModule,
    // #endregion
  ],

  providers: [
    // #region Errors: ExceptionFilter
    {
      provide: APP_FILTER,
      inject: [NextService, LogService],
      useFactory: (nextService: NextService, logService: LogService) => {
        return new HttpErrorFilter(nextService, logService);
      },
    },
    // #endregion

    // #region Logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // #endregion

    // #region Cache interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    // #endregion

    // #region GraphQL
    DateScalar,
    ByteArrayScalar,
    // #endregion
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(NextAssetsMiddleware).forRoutes({ path: '_next*', method: RequestMethod.GET });
    consumer.apply(NextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
