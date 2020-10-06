/** @format */
// eslint-disable-next-line spaced-comment
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import type Express from 'express';
import Next from 'next';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, CacheModule, UnauthorizedException, Type } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import type { GraphQLSchema } from 'graphql/type/schema';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import type WebSocket from 'ws';
import { RenderModule } from 'nest-next';
import redisCacheStore from 'cache-manager-redis-store';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import winston, { Logger } from 'winston';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
// import { LoggingInterceptor } from '@algoan/nestjs-logging-interceptor';
//#endregion
//#region Imports Local
import type { User } from '@lib/types';
import type { PortalWebsocket } from '@back/shared/types';

import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';

import { ConfigModule, ConfigService } from '@app/config';
import { winstonOptions } from '@back/shared/logger.options';
import { LoggingInterceptor } from '@app/logging.interceptor';
// import { CacheInterceptorProvider } from '@app/cache.interceptor';
import { SoapModule } from '@app/soap';

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
import { ReportsModule } from '@back/reports/reports.module';
import { DocFlowModule } from '@back/docflow/docflow.module';
import { NewsEntity } from '@back/news/news.entity';
import { FilesModule } from '@back/files/files.module';

import { TypeOrmLogger } from '@back/shared/typeormlogger';

import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
//#endregion

const environment = resolve(__dirname, __DEV__ ? '../../..' : '../..', '.local/.env');

//#region TypeOrm config options
export const typeOrmPostgres = (configService: ConfigService, logger: Logger): TypeOrmModuleOptions => ({
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
  logging: configService.get<boolean>('DEVELOPMENT')
    ? true
    : configService.get('DATABASE_LOGGING') === 'false'
    ? false
    : configService.get('DATABASE_LOGGING') === 'true'
    ? true
    : JSON.parse(configService.get('DATABASE_LOGGING')),
  entities: [GroupEntity, ProfileEntity, UserEntity, NewsEntity],
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
//#endregion

@Module({
  imports: [
    //#region Config module
    ConfigModule.register(environment),
    //#endregion

    //#region Logging module
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => winstonOptions(configService),
    }),
    //#endregion

    //#region Logging module
    PrometheusModule.register({}),
    //#endregion

    //#region Next RenderModule
    RenderModule.forRootAsync(Next({ dev: __DEV__, dir: __DEV__ ? 'apps/portal' : '', quiet: false }), {
      // passthrough404: true,
      viewsDir: null,
    }),
    //#endregion

    //#region Cache Manager - Redis
    CacheModule.registerAsync({
      imports: [WinstonModule],
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.log('Redis connection: success', 'CacheModule');

        return {
          store: redisCacheStore,
          ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
          max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
          url: configService.get<string>('HTTP_REDIS_URI'),
          // retry_strategy: (options) => {}
        };
      },
    }),
    //#endregion

    //#region GraphQL
    Upload,
    GraphQLModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const DEV = configService.get<boolean>('DEVELOPMENT');

        const { logger } = configService;
        const store = sessionRedis(configService, logger);
        const auth = session(configService, logger, store, true);
        const maxFileSize = configService.get<number>('MAX_FILE_SIZE');

        return {
          debug: DEV,
          tracing: DEV,
          introspection: DEV,
          connectToDevTools: DEV,
          playground: DEV
            ? {
                settings: {
                  // Когда в playground режиме, нажмите settings и добавьте строку:
                  'request.credentials': 'same-origin',
                  'schema.polling.endpointFilter': '*localhost*',
                  'schema.polling.enable': true,
                  'schema.polling.interval': 5000,
                },
              }
            : false,
          typePaths: ['./**/*.graphql'],
          cors: {
            // origin: 'https://localhost:4000',
            credentials: true,
          },
          installSubscriptionHandlers: true,
          subscriptions: {
            keepAlive: 0,
            onConnect: async (
              connectionParameters: Record<string, any>,
              websocket: WebSocket,
              context: ConnectionContext,
            ): Promise<PortalWebsocket> => {
              const user = await new Promise<User | undefined>((resolveOnConnect) => {
                const request = (websocket as any)?.upgradeReq as Express.Request;
                const response = ({} as unknown) as Express.Response;

                auth(request, response, () => resolveOnConnect((websocket as any)?.upgradeReq?.session?.passport?.user || undefined));
              });

              if (user) {
                return { user, req: context.request, socket: websocket };
              }

              throw new UnauthorizedException();
            },
            // onDisconnect: async (_websocket: WebSocket, _context: ConnectionContext): Promise<any> => {
            //   // eslint-disable-next-line no-debugger
            //   debugger;
            // },
          },
          uploads: {
            maxFileSize,
          },
          context: async ({ req, res, connection }) => {
            // subscriptions
            if (connection) {
              return connection.context;
            }

            const user = await new Promise<User | undefined>((resolveOnConnect) => {
              auth(req, res, () => resolveOnConnect(req.user || undefined));
            });

            // queries and mutations
            return { user, req, res };
          },
          transformSchema: (schema: GraphQLSchema) => {
            // eslint-disable-next-line no-param-reassign
            configService.schema = schema;
            return schema;
          },
        };
      },
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [WinstonModule],
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.log('Database connection: success', 'Database');

        return typeOrmPostgres(configService, logger);
      },
    }),
    //#endregion

    SoapModule,

    //#region Authentication
    AuthModule,
    //#endregion

    //#region Profile
    ProfileModule,
    //#endregion

    //#region Groups
    GroupModule,
    //#endregion

    //#region Users
    UserModule,
    //#endregion

    //#region News
    NewsModule,
    //#endregion

    //#region Files module
    FilesModule,
    //#endregion

    //#region Tickets module
    TicketsModule,
    ReportsModule,
    DocFlowModule,
    //#endregion

    //#region Controllers module
    ControllersModule,
    //#endregion

    SubscriptionsModule,
  ],

  providers: [
    //#region GraphQL
    DateScalar,
    ByteArrayScalar,
    //#endregion

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // CacheInterceptorProvider,
  ],
})
export class AppModule {}
