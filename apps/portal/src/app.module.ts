/** @format */
// eslint-disable-next-line spaced-comment
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import { parse as urlLibParse } from 'url';
import type Express from 'express';
import Next from 'next';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { OrderDirection } from 'typeorm-graphql-pagination';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, UnauthorizedException, HttpModule, LoggerService, Logger, OnModuleInit } from '@nestjs/common';
import { WinstonModule, WinstonLogger, WINSTON_MODULE_PROVIDER, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GraphQLModule, registerEnumType } from '@nestjs/graphql';
import type { GraphQLSchema } from 'graphql/type/schema';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import type WebSocket from 'ws';
import { RenderModule } from 'nest-next';
import { RedisModule, RedisService, RedisModuleOptions } from 'nest-redis';
import { LdapModule, Scope, ldapADattributes, LoggerContext } from 'nestjs-ldap';
import type { Redis } from 'ioredis';
//#endregion
//#region Imports Local
import type { GraphQLContext, WebsocketContext } from '@back/shared/types';

import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';

import { redisOptions } from '@back/shared/redis.options';
import { TypeOrmLogger } from '@back/shared/typeorm.logger';
// import { Upload } from '@back/shared/Upload.scalar';
import { DateScalar } from '@back/shared/Date.scalar';
// import { ByteArray } from '@back/shared/ByteArray.scalar';

import { Folder } from '@back/files/graphql/Folder';
import { TkWhere } from '@back/tickets/graphql/TkWhere';
import { PhonebookColumnNames } from '@back/profile/graphql/PhonebookColumnNames';
import { Contact } from '@back/shared/graphql/Contact';
import { LoginService } from '@back/shared/graphql/LoginService';
import { Gender } from '@back/shared/graphql/Gender';

import { ConfigModule, ConfigService, LDAPDomainConfig } from '@app/config';
import { LoggingInterceptor } from '@app/logging.interceptor';
// import { CacheInterceptorProvider } from '@app/cache.interceptor';
import { SoapModule } from '@app/soap';
import { ControllersModule } from '@back/controllers/controllers.module';
import { AuthModule } from '@back/auth';
import { GroupModule, Group } from '@back/group';
import { ProfileModule, Profile } from '@back/profile';
import { UserModule, User } from '@back/user';
import { NewsModule, News } from '@back/news';
import { TicketsModule } from '@back/tickets';
// import { ReportsModule } from '@back/reports';
// import { DocFlowModule } fro.local/docflowlow';
// import { FilesModule } from '@back/files';

import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { winstonOptions } from './shared/logger.options';
//#endregion

const environment = resolve(__dirname, __DEV__ ? '../../..' : '../..', '.local/.env');

//#region TypeOrm config options
export const typeOrmPostgres = (configService: ConfigService, logger: LoggerService, redis?: Redis): TypeOrmModuleOptions => ({
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
  entities: [Group, Profile, News, User],
  migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
  cache: /* redis */ {
    type: 'ioredis', // "ioredis/cluster"
    options: redisOptions({
      clientName: 'DATABASE',
      url: urlLibParse(configService.get<string>('DATABASE_REDIS_URI')),
      ttl: configService.get<number>('DATABASE_REDIS_TTL') || 600,
      prefix: 'DATABASE:',
    }),
    alwaysEnabled: true,
    /**
     * Time in milliseconds in which cache will expire.
     * This can be setup per-query.
     * Default value is 1000 which is equivalent to 1 second.
     */
    duration: configService.get<number>('DATABASE_REDIS_TTL') || 600,
  },
});
//#endregion

@Module({
  imports: [
    //#region Config module
    ConfigModule.register(environment),
    //#endregion

    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => winstonOptions(configService),
    }),

    //#region Redis module
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const result: RedisModuleOptions[] = [];

        if (configService.get<string>('DATABASE_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'DATABASE',
              url: urlLibParse(configService.get<string>('DATABASE_REDIS_URI')),
              ttl: configService.get<number>('DATABASE_REDIS_TTL') || 60,
              prefix: 'DATABASE:',
            }),
          );
        }

        if (configService.get<string>('LDAP_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'LDAP',
              url: urlLibParse(configService.get<string>('LDAP_REDIS_URI')),
              ttl: configService.get<number>('LDAP_REDIS_TTL') || 60,
              prefix: 'LDAP:',
            }),
          );
        }

        if (configService.get<string>('SESSION_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'SESSION',
              url: urlLibParse(configService.get<string>('SESSION_REDIS_URI')),
              ttl: configService.get<number>('SESSION_REDIS_TTL') || 60,
              prefix: 'SESSION:',
            }),
          );
        }

        if (configService.get<string>('HTTP_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'HTTP',
              url: urlLibParse(configService.get<string>('HTTP_REDIS_URI')),
              ttl: configService.get<number>('HTTP_REDIS_TTL') || 60,
              prefix: 'HTTP:',
            }),
          );

          result.push(
            redisOptions({
              clientName: 'PUBLISHER',
              url: urlLibParse(configService.get<string>('HTTP_REDIS_URI')),
              ttl: configService.get<number>('HTTP_REDIS_TTL') || 60,
              prefix: 'PUBLISHER:',
            }),
          );

          result.push(
            redisOptions({
              clientName: 'SUBSCRIBER',
              url: urlLibParse(configService.get<string>('HTTP_REDIS_URI')),
              ttl: configService.get<number>('HTTP_REDIS_TTL') || 60,
              prefix: 'SUBSCRIBER:',
            }),
          );
        }

        if (configService.get<string>('NEXTCLOUD_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'NEXTCLOUD',
              url: urlLibParse(configService.get<string>('NEXTCLOUD_REDIS_URI')),
              ttl: configService.get<number>('NEXTCLOUD_REDIS_TTL') || 60,
              prefix: 'NEXTCLOUD:',
            }),
          );
        }

        if (configService.get<string>('DOCFLOW_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'DOCFLOW',
              url: urlLibParse(configService.get<string>('DOCFLOW_REDIS_URI')),
              ttl: configService.get<number>('DOCFLOW_REDIS_TTL') || 60,
              prefix: 'DOCFLOW:',
            }),
          );
        }

        if (configService.get<string>('TICKETS_REDIS_URI')) {
          result.push(
            redisOptions({
              clientName: 'TICKETS',
              url: urlLibParse(configService.get<string>('TICKETS_REDIS_URI')),
              ttl: configService.get<number>('TICKETS_REDIS_TTL') || 60,
              prefix: 'TICKETS:',
            }),
          );
        }

        return result;
      },
    }),
    //#endregion

    //#region Logging module
    // PrometheusModule.register({}),
    //#endregion

    //#region Cache Manager - Redis
    // CacheModule.registerAsync({
    //   imports: [WinstonModule],
    //   inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
    //   useFactory: async (configService: ConfigService, logger: Logger) => {
    //     logger.log('Redis connection: success', 'CacheModule');

    //     return {
    //       store: redisCacheStore,
    //       ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
    //       max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
    //       url: configService.get<string>('HTTP_REDIS_URI'),
    //       // retry_strategy: (options) => {}
    //     };
    //   },
    // }),
    //#endregion

    HttpModule.registerAsync({
      useFactory: () => ({
        // timeout: TIMEOUT,
      }),
    }),
    SoapModule,

    //#region GraphQL
    GraphQLModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const DEV = configService.get<boolean>('DEVELOPMENT');

        const { logger } = configService;
        const store = sessionRedis(configService, logger);
        const auth = session(configService, logger, store, true);
        const maxFileSize = configService.get<number>('MAX_FILE_SIZE');

        registerEnumType(Contact, {
          name: 'Contact',
        });
        registerEnumType(Gender, {
          name: 'Gender',
        });
        registerEnumType(LoginService, {
          name: 'LoginService',
        });
        registerEnumType(PhonebookColumnNames, {
          name: 'PhonebookColumnNames',
        });
        registerEnumType(Folder, {
          name: 'Folder',
        });
        registerEnumType(TkWhere, {
          name: 'TkWhere',
        });
        registerEnumType(OrderDirection, {
          name: 'OrderDirection',
        });

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
          // typePaths: ['./**/*.graphql'],
          cors: {
            // origin: 'https://localhost:4000',
            credentials: true,
          },
          buildSchemaOptions: {
            dateScalarMode: 'timestamp',
          },
          installSubscriptionHandlers: true,
          autoSchemaFile: resolve(process.cwd(), 'apps/portal/src/graphql.gql'),
          sortSchema: true,
          subscriptions: {
            keepAlive: 0,
            onConnect: async (
              connectionParameters: Record<string, any>,
              websocket: WebSocket,
              context: ConnectionContext,
            ): Promise<WebsocketContext> => {
              const user = await new Promise<User | undefined>((resolveOnConnect) => {
                const request = (websocket as Record<string, unknown>)?.upgradeReq as Express.Request;
                const response = ({} as unknown) as Express.Response;

                auth(request, response, () => resolveOnConnect(request.session?.passport?.user));
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
          context: async ({ req, res, connection }): Promise<GraphQLContext> => {
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
      inject: [WINSTON_MODULE_NEST_PROVIDER, ConfigService, RedisService],
      useFactory: async (logger: WinstonLogger, configService: ConfigService, redisService: RedisService) => {
        logger.log('Database connection: success', 'Database');

        let cache: Redis | undefined;
        try {
          cache = redisService.getClient('DATABASE');
        } catch {
          cache = undefined;
        }

        return typeOrmPostgres(configService, logger, cache);
      },
    }),
    //#endregion

    //#region LDAP Module
    LdapModule.registerAsync({
      inject: [WINSTON_MODULE_NEST_PROVIDER, ConfigService, RedisService],
      useFactory: async (logger: WinstonLogger, configService: ConfigService, redisService: RedisService) => {
        let cache: Redis | undefined;
        try {
          cache = redisService.getClient('LDAP');
        } catch {
          cache = undefined;
        }

        const domainString = configService.get<string>('LDAP');
        let domainsConfig: Record<string, LDAPDomainConfig>;
        try {
          domainsConfig = JSON.parse(domainString);
        } catch {
          throw new Error('Not available authentication profiles.');
        }

        const domains = Object.keys(domainsConfig).map((name) => ({
          name,
          url: domainsConfig[name].url,
          bindDN: domainsConfig[name].bindDn,
          bindCredentials: domainsConfig[name].bindPw,
          searchBase: domainsConfig[name].searchBase,
          searchFilter: domainsConfig[name].searchUser,
          searchScope: 'sub' as Scope,
          groupSearchBase: domainsConfig[name].searchBase,
          groupSearchFilter: domainsConfig[name].searchGroup,
          groupSearchScope: 'sub' as Scope,
          groupDnProperty: 'dn',
          groupSearchAttributes: ldapADattributes,
          searchAttributes: ldapADattributes,
          hideSynchronization: domainsConfig[name].hideSynchronization === 'true' ?? false,
          searchBaseAllUsers: domainsConfig[name].searchBase,
          searchFilterAllUsers: domainsConfig[name].searchAllUsers,
          searchFilterAllGroups: domainsConfig[name].searchAllGroups,
          searchScopeAllUsers: 'sub' as Scope,
          searchAttributesAllUsers: ldapADattributes,
          reconnect: true,
          newObject: domainsConfig[name].newBase,
        }));

        return {
          cache,
          cacheTtl: configService.get<number>('LDAP_REDIS_TTL'),
          domains,
          logger,
        };
      },
    }),
    //#endregion

    //#region Groups
    GroupModule,
    //#endregion

    //#region Profile
    ProfileModule,
    //#endregion

    //#region Users
    UserModule,
    //#endregion

    //#region News module
    // NewsModule,
    //#endregion

    //#region Files module
    // FilesModule,
    //#endregion

    //#region Tickets
    TicketsModule,
    // ReportsModule,
    // DocFlowModule,
    //#endregion

    //#region Authentication
    AuthModule,
    //#endregion

    //#region Controllers module
    ControllersModule,
    //#endregion

    SubscriptionsModule,

    //#region Next RenderModule
    RenderModule.forRootAsync(Next({ dev: __DEV__, dir: __DEV__ ? 'apps/portal' : '', quiet: false }), {
      // passthrough404: true,
      viewsDir: null,
    }),
    //#endregion
  ],

  providers: [
    //#region GraphQL
    DateScalar,
    // ByteArray,
    //#endregion

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // CacheInterceptorProvider,
  ],
})
export class AppModule {}
