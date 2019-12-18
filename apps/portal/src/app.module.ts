/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

// #region Imports NPM
import { resolve } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { Module, CacheModule } from '@nestjs/common';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RenderModule } from 'nest-next';
import redisCacheStore from 'cache-manager-redis-store';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { CacheInterceptorProvider } from '@app/cache.interceptor';
import { HttpErrorFilter } from './filters/http-error.filter';
import { DateScalar } from './shared/date.scalar';
import { ByteArrayScalar } from './shared/bytearray.scalar';
import { HomeModule } from './controllers/controllers.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NewsModule } from './news/news.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileEntity } from './profile/profile.entity';
import { UserEntity } from './user/user.entity';
import { GroupModule } from './group/group.module';
import { GroupEntity } from './group/group.entity';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../../..') : '../..', '.env');

@Module({
  imports: [
    // #region Logging module
    LoggerModule,
    // #endregion

    // #region Config module
    ConfigModule.register(env),
    // #endregion

    // #region Next RenderModule
    RenderModule,
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
            `prefix="${configService.get('HTTP_REDIS_PREFIX') || 'HTTP'}" ` +
            `password="${configService.get('HTTP_REDIS_PASSWORD') ? '{MASKED}' : ''}" `,
          'Cache',
        );

        return {
          store: redisCacheStore,
          ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
          max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
          host: configService.get<string>('HTTP_REDIS_HOST'),
          port: configService.get<number>('HTTP_REDIS_PORT'),
          db: configService.get<number>('HTTP_REDIS_DB'),
          password: configService.get<string>('HTTP_REDIS_PASSWORD') || undefined,
          keyPrefix: configService.get<string>('HTTP_REDIS_PREFIX') || 'HTTP',
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
      debug: dev,
      /* eslint-disable prettier/prettier */
      playground: dev
        ? {
          settings: {
            // Когда в playground режиме, нажмите settings и добавте строку:
            'request.credentials': 'same-origin',
          },
        }
        : false,
      /* eslint-enable prettier/prettier */
      typePaths: ['./**/*.graphql'],
      context: ({ req, res }) => ({ req, res }),
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logger: LogService) => ({
        name: 'default',
        keepConnectionAlive: true,
        type: configService.get<string>('DATABASE_CONNECTION'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        // database: configService.get<string>('DATABASE_DATABASE'),
        replication: {
          master: configService.get<string>('DATABASE_DATABASE'),
          // slaves: [
          // ]
        },
        schema: configService.get<string>('DATABASE_SCHEMA'),
        uuidExtension: 'pgcrypto',
        logger,
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
        dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
        /* eslint-disable prettier/prettier */
        logging: dev
          ? true
          : configService.get('DATABASE_LOGGING') === 'false'
            ? false
            : configService.get('DATABASE_LOGGING') === 'true'
              ? true
              : JSON.parse(configService.get('DATABASE_LOGGING')),
        /* eslint-enable prettier/prettier */
        entities: [ProfileEntity, GroupEntity, UserEntity],
        migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
        cache: {
          type: 'redis',
          options: {
            host: configService.get<string>('DATABASE_REDIS_HOST'),
            port: configService.get<number>('DATABASE_REDIS_PORT'),
            password: configService.get<string>('DATABASE_REDIS_PASSWORD') || undefined,
            db: configService.get<number>('DATABASE_REDIS_DB'),
            prefix: configService.get<string>('DATABASE_REDIS_PREFIX') || 'DB',
          },
          duration: configService.get<number>('DATABASE_REDIS_TTL'),
        },
      }),
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
      inject: [LogService],
      useFactory: (logService: LogService) => {
        return new HttpErrorFilter(logService);
      },
    },
    // #endregion

    LoggingInterceptorProvider,

    CacheInterceptorProvider,

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
export class AppModule {}
