/** @format */
// eslint-disable-next-line spaced-comment
/// <reference types="../../../typings/global" />

// #region Imports NPM
import { resolve } from 'path';
// import { APP_FILTER } from '@nestjs/core';
// import Next from 'next';
import { Module, CacheModule } from '@nestjs/common';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  I18nJsonParser,
  CookieResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RenderModule } from 'nest-next';
import redisCacheStore from 'cache-manager-redis-store';
import { LoggerModule, Logger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { CacheInterceptorProvider } from '@app/cache.interceptor';
// import { HttpErrorFilter } from './filters/http-error.filter';

import { DateScalar } from '@back/shared/date.scalar';
import { ByteArrayScalar } from '@back/shared/bytearray.scalar';
import { ControllersModule } from '@back/controllers/controllers.module';
import { AuthModule } from '@back/auth/auth.module';
import { UserModule } from '@back/user/user.module';
import { NewsModule } from '@back/news/news.module';
import { ProfileModule } from '@back/profile/profile.module';
import { GroupModule } from '@back/group/group.module';
import { Upload } from '@back/shared/upload.scalar';

import { GroupEntity } from '@back/group/group.entity';
import { ProfileEntity } from '@back/profile/profile.entity';
import { UserEntity } from '@back/user/user.entity';
import { TicketsModule } from '@back/tickets/tickets.module';
import { NewsEntity } from '@back/news/news.entity';
import { FilesModule } from '@back/files/files.module';
import { FilesFolderEntity } from '@back/files/files.folder.entity';
import { FilesEntity } from '@back/files/files.entity';

import { TypeOrmLogger } from '@back/shared/typeormlogger';
import { pinoOptions } from '@back/shared/pino.options';
// #endregion

const env = resolve(__dirname, __DEV__ ? '../../..' : '../..', '.env');

// #region TypeOrm config options
const typeOrmPostgres = (configService: ConfigService, logger: Logger): TypeOrmModuleOptions => ({
  name: 'default',
  keepConnectionAlive: true,
  type: 'postgres',
  replication: {
    master: { url: configService.get<string>('DATABASE_URI') },
    slaves: [{ url: configService.get<string>('DATABASE_URI_RD') }],
  },
  schema: configService.get<string>('DATABASE_SCHEMA'),
  uuidExtension: 'pgcrypto',
  logger: new TypeOrmLogger(logger),
  synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
  dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
  logging: __DEV__
    ? true
    : configService.get('DATABASE_LOGGING') === 'false'
    ? false
    : configService.get('DATABASE_LOGGING') === 'true'
    ? true
    : JSON.parse(configService.get('DATABASE_LOGGING')),
  entities: [GroupEntity, ProfileEntity, UserEntity, NewsEntity, FilesFolderEntity, FilesEntity],
  migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
  cache: {
    type: 'redis', // "ioredis/cluster"
    options: {
      url: configService.get<string>('DATABASE_REDIS_URI'),
      scaleReads: 'slave',
      max: 10000,
    },
    alwaysEnabled: true,
    /**
     * Time in milliseconds in which cache will expire.
     * This can be setup per-query.
     * Default value is 1000 which is equivalent to 1 second.
     */
    duration: configService.get<number>('DATABASE_REDIS_TTL'),
  },
});
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule.register(env),
    // #endregion

    // #region Logging module
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => pinoOptions(config.get<string>('LOGLEVEL')),
    }),
    // #endregion

    // #region Next RenderModule
    // TODO: появляется NOT FOUND перед загрузкой страницы
    RenderModule, // .forRootAsync(Next({ dev: __DEV__, dir: __DEV__ ? 'apps/portal' : '', quiet: false })),
    // #endregion

    // #region Cache Manager - Redis
    CacheModule.registerAsync({
      imports: [LoggerModule],
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.debug(
          `install cache: ` +
            `url="${configService.get('HTTP_REDIS_URI')}", ` +
            `ttl=${configService.get('HTTP_REDIS_TTL')}s, ` +
            `max objects=${configService.get('HTTP_REDIS_MAX_OBJECTS')} `,
          'CacheModule',
        );

        return {
          store: redisCacheStore,
          ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
          max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
          url: configService.get<string>('HTTP_REDIS_URI'),
          // retry_strategy: (options) => {}
        };
      },
    }),
    // #endregion

    // #region Locale I18n
    I18nModule.forRootAsync({
      inject: [ConfigService],
      parser: I18nJsonParser,
      useFactory: async (configService: ConfigService) => ({
        parserOptions: {
          path: configService.i18nPath,
        },
        fallbackLanguage: configService.fallbackLanguage,
        resolvers: [
          { use: QueryResolver, options: ['lang', 'locale', 'l'] },
          new HeaderResolver(),
          AcceptLanguageResolver,
          new CookieResolver(['lang', 'locale', 'l']),
        ],
      }),
    }),
    // #endregion

    // #region GraphQL
    Upload,
    GraphQLModule.forRoot({
      debug: __DEV__,
      playground: __DEV__
        ? {
            settings: {
              // Когда в playground режиме, нажмите settings и добавьте строку:
              'request.credentials': 'same-origin',
            },
          }
        : false,
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      uploads: {
        maxFileSize: 100000000, // 100MB
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [LoggerModule],
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.debug(
          `Replication: ` +
            `master url="${configService.get<string>('DATABASE_URI')}, ` +
            `slave url="${configService.get<string>('DATABASE_URI_RD')}. ` +
            `Cache url="${configService.get<string>('DATABASE_REDIS_URI')}", ` +
            `ttl=${configService.get<number>('DATABASE_REDIS_TTL')}ms.`,
          'Database',
        );

        return typeOrmPostgres(configService, logger);
      },
    }),
    // #endregion

    // #region Profile
    ProfileModule,
    // #endregion

    // #region Authentication
    AuthModule,
    // #endregion

    // #region Groups
    GroupModule,
    // #endregion

    // #region Users
    UserModule,
    // #endregion

    // #region News
    NewsModule,
    // #endregion

    // #region Files module
    FilesModule,
    // #endregion

    // #region Tickets module
    TicketsModule,
    // #endregion

    // #region Controllers module
    ControllersModule,
    // #endregion
  ],

  providers: [
    // #region GraphQL
    DateScalar,
    ByteArrayScalar,
    // #endregion

    // #region Errors
    // TODO: Next.JS is forwarding through RenderService -> setErrorHandler
    // {
    //   provide: APP_FILTER,
    //   inject: [LogService],
    //   useFactory: (logService: LogService) => {
    //     return new HttpErrorFilter(logService);
    //   },
    // },
    // #endregion

    LoggingInterceptorProvider,

    CacheInterceptorProvider,

    // #region GraphQL interceptor
    // {
    // TODO: сделать чтобы IntrospectionQuery блокировался до тех пор пока кто-либо не воспользуется login
    //   provide: APP_INTERCEPTOR,
    //   useClass: GraphQLInterceptor,
    // },
    // #endregion
  ],
})
export class AppModule {}
