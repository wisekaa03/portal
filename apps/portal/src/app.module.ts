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
import { RenderModule } from 'nest-next-2';
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
import { TicketDepartmentModule } from './ticket/department/department.module';
import { TicketServiceModule } from './ticket/service/service.module';
import { TicketGroupServiceModule } from './ticket/group-service/group-service.module';
import { TicketsModule } from './ticket/tickets/tickets.module';
import { TicketAttachmentsModule } from './ticket/attachments/attachments.module';
import { TicketCommentsModule } from './ticket/comments/comments.module';
import { TicketOldServiceModule } from './ticket/old-service/old-service.module';
import { NewsEntity } from './news/news.entity';
import { MediaModule } from './media/media.module';
import { MediaDirectoryEntity } from './media/media.directory.entity';
import { MediaEntity } from './media/media.entity';
import { Upload } from './shared/upload.scalar';
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
            `url="${configService.get('HTTP_REDIS_URI')}", ` +
            `ttl=${configService.get('HTTP_REDIS_TTL')}s, ` +
            `max objects=${configService.get('HTTP_REDIS_MAX_OBJECTS')} `,
          'Cache',
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
    Upload,
    /* eslint-disable prettier/prettier */
    GraphQLModule.forRoot({
      debug: dev,
      playground: dev
        ? {
          settings: {
            // Когда в playground режиме, нажмите settings и добавте строку:
            'request.credentials': 'same-origin',
          },
        }
        : false,
      typePaths: ['./**/*.graphql'],
      uploads: {
        maxFileSize: 100000000, // 100MB
        maxFiles: 5,
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logger: LogService) => {
        logger.debug(
          `Replication: ` +
            `master url="${configService.get<string>('DATABASE_URI')}, ` +
            `slave url="${configService.get<string>('DATABASE_URI_RD')}. ` +
          `Cache url="${configService.get<string>('DATABASE_REDIS_URI')}", ` +
            `ttl=${configService.get<number>('DATABASE_REDIS_TTL')}ms.`,
          'Database',
        );

        return {
          name: 'default',
          keepConnectionAlive: true,
          type: 'postgres',
          replication: {
            master: { url: configService.get<string>('DATABASE_URI') },
            slaves: [{ url: configService.get<string>('DATABASE_URI_RD') }],
          },
          schema: configService.get<string>('DATABASE_SCHEMA'),
          uuidExtension: 'pgcrypto',
          logger,
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
          dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
          logging: dev
            ? true
            : configService.get('DATABASE_LOGGING') === 'false'
              ? false
              : configService.get('DATABASE_LOGGING') === 'true'
                ? true
                : JSON.parse(configService.get('DATABASE_LOGGING')),
          entities: [
            ProfileEntity, GroupEntity, UserEntity,
            NewsEntity,
            MediaDirectoryEntity, MediaEntity,
            TicketDepartmentModule, TicketGroupServiceModule, TicketServiceModule,
            TicketsModule, TicketAttachmentsModule, TicketCommentsModule
          ],
          migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
          cache: {
            type: 'redis', // "ioredis/cluster"
            options: {
              url: configService.get<string>('DATABASE_REDIS_URI'),
              scaleReads: 'slave',
            },
            alwaysEnabled: true,
            /**
            * Time in milliseconds in which cache will expire.
            * This can be setup per-query.
            * Default value is 1000 which is equivalent to 1 second.
            */
            duration: configService.get<number>('DATABASE_REDIS_TTL'),
          },
        } as TypeOrmModuleOptions;
      },
    }),
    /* eslint-enable prettier/prettier */
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

    // #region Ticket
    TicketDepartmentModule,
    TicketServiceModule,
    TicketGroupServiceModule,
    TicketsModule,
    TicketAttachmentsModule,
    TicketCommentsModule,
    TicketOldServiceModule,
    // #endregion

    // #region Media
    MediaModule,
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
    // TODO: сделать чтобы IntrospectionQuery блокировался до тех пор пока кто-либо не воспользуется login
    //   provide: APP_INTERCEPTOR,
    //   useClass: GraphQLInterceptor,
    // },
    // #endregion
  ],
})
export class AppModule {}
