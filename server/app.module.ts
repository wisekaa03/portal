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
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logService: LogService) => {
        logService.debug(
          `install cache: ` +
            `host="${configService.get('HTTP_REDIS_HOST')}" ` +
            `port="${configService.get('HTTP_REDIS_PORT')}" ` +
            `db="${configService.get('HTTP_REDIS_DB')}" ` +
            `ttl="${configService.get('HTTP_REDIS_TTL')}" ` +
            `max objects="${configService.get('HTTP_REDIS_MAX_OBJECTS')}" ` +
            `prefix="${configService.get('HTTP_REDIS_PREFIX')}" ` +
            `password="${configService.get('HTTP_REDIS_PASSWORD') ? '{MASKED}' : ''}" `,
          'Cache',
        );

        return {
          store: redisCacheStore,
          ttl: parseInt(configService.get('HTTP_REDIS_TTL'), 10), // seconds
          max: parseInt(configService.get('HTTP_REDIS_MAX_OBJECTS'), 10), // maximum number of items in cache
          host: configService.get('HTTP_REDIS_HOST'),
          port: parseInt(configService.get('HTTP_REDIS_PORT'), 10),
          db: configService.get('HTTP_REDIS_DB') ? parseInt(configService.get('HTTP_REDIS_DB'), 10) : undefined,
          password: configService.get('HTTP_REDIS_PASSWORD') ? configService.get('HTTP_REDIS_PASSWORD') : undefined,
          keyPrefix: configService.get('HTTP_REDIS_PREFIX') ? configService.get('HTTP_REDIS_PREFIX') : undefined,
          // retry_strategy: (options) => {}
        };
      },
    }),
    // #endregion

    // #region Locale I18n
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
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
    // #region GraphQL
    DateScalar,
    ByteArrayScalar,
    // #endregion

    // #region Errors
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

    // #region GraphQL interceptor
    // {
    // TODO: сделать чтобы IntrospectionQuery блокировался до тех пор
    // TODO: пока кто-либо не воспользуется login
    //   provide: APP_INTERCEPTOR,
    //   useClass: GraphQLInterceptor,
    // },
    // #endregion
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(NextAssetsMiddleware).forRoutes({ path: '_next*', method: RequestMethod.GET });
    consumer.apply(NextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
