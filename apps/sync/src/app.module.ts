/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule, Logger } from 'nestjs-pino';
import { LdapModule, Scope, ldapADattributes, LdapModuleOptions } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { UserModule } from '@back/user/user.module';
import { UserEntity } from '@back/user/user.entity';
import { ProfileModule } from '@back/profile/profile.module';
import { ProfileEntity } from '@back/profile/profile.entity';
import { GroupModule } from '@back/group/group.module';
import { GroupEntity } from '@back/group/group.entity';
import { pinoOptions } from '@back/shared/pino.options';
import { TypeOrmLogger } from '@back/shared/typeormlogger';
import { AppController } from './app.controller';
import { SyncService } from './app.service';
//#endregion

const environment = resolve(__dirname, '../../..', '.local/.env');

@Module({
  imports: [
    //#region Config & Log module
    ConfigModule.register(environment),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => pinoOptions(config),
    }),
    //#endregion

    //#region LDAP Module
    LdapModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('LDAP_URL'),
        bindDN: configService.get<string>('LDAP_BIND_DN'),
        bindCredentials: configService.get<string>('LDAP_BIND_PW'),
        searchBase: configService.get<string>('LDAP_SEARCH_BASE'),
        searchFilter: configService.get<string>('LDAP_SEARCH_USER'),
        searchScope: 'sub' as Scope,
        groupSearchBase: configService.get<string>('LDAP_SEARCH_BASE'),
        groupSearchFilter: configService.get<string>('LDAP_SEARCH_GROUP'),
        groupSearchScope: 'sub' as Scope,
        groupDnProperty: 'dn',
        groupSearchAttributes: ldapADattributes,
        searchAttributes: ldapADattributes,
        searchBaseAllUsers: configService.get<string>('LDAP_SEARCH_BASE'),
        searchFilterAllUsers: configService.get<string>('LDAP_SEARCH_FILTER_ALL_USERS'),
        searchFilterAllGroups: configService.get<string>('LDAP_SEARCH_FILTER_ALL_GROUPS'),
        searchScopeAllUsers: 'sub' as Scope,
        searchAttributesAllUsers: ldapADattributes,
        reconnect: true,
        cacheUrl: configService.get<string>('LDAP_REDIS_URI'),
        cacheTtl: configService.get<number>('LDAP_REDIS_TTL'),
      }),
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [LoggerModule],
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger) =>
        ({
          name: 'default',
          keepConnectionAlive: true,
          type: 'postgres',
          replication: {
            master: {
              url: configService.get<string>('DATABASE_URI'),
            },
            slaves: [{ url: configService.get<string>('DATABASE_URI_RD') }],
          },
          schema: configService.get<string>('DATABASE_SCHEMA'),
          uuidExtension: 'pgcrypto',
          logger: new TypeOrmLogger(logger),
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
          dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
          logging:
            configService.get('DATABASE_LOGGING') === 'false'
              ? false
              : configService.get('DATABASE_LOGGING') === 'true'
              ? true
              : JSON.parse(configService.get('DATABASE_LOGGING')),
          entities: [ProfileEntity, GroupEntity, UserEntity],
          migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
          cache: {
            type: 'redis',
            options: {
              url: configService.get<string>('DATABASE_REDIS_URI'),
            },
            duration: configService.get<number>('DATABASE_REDIS_TTL'),
          },
        } as TypeOrmModuleOptions),
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forFeature([ProfileEntity, GroupEntity, UserEntity]),
    //#endregion

    GroupModule,
    UserModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [SyncService, LoggingInterceptorProvider],
})
export class AppModule {}
