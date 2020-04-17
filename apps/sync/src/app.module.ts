/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

// #region Imports NPM
import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LdapModule, Scope, ldapADattributes, LdapModuleOptions } from '@app/ldap';
import { LoggerModule, LogService } from '@app/logger';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { UserModule } from '@back/user/user.module';
import { UserEntity } from '@back/user/user.entity';
import { ProfileModule } from '@back/profile/profile.module';
import { ProfileEntity } from '@back/profile/profile.entity';
import { GroupModule } from '@back/group/group.module';
import { GroupEntity } from '@back/group/group.entity';
import { AppController } from './app.controller';
import { SyncService } from './app.service';
// #endregion

const env = resolve(__dirname, __DEV__ ? (__TEST__ ? '../../..' : '../../..') : '../../..', '.env');

@Module({
  imports: [
    // #region Config & Log module
    ConfigModule.register(env),
    LoggerModule,
    // #endregion

    // #region Locale I18n
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      parser: I18nJsonParser,
      useFactory: async (configService: ConfigService) => ({
        parserOptions: {
          path: configService.i18nPath,
        },
        fallbackLanguage: configService.fallbackLanguage,
        resolvers: [],
      }),
    }),
    // #endregion

    // #region LDAP Module
    LdapModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          url: configService.get<string>('LDAP_URL'),
          bindDN: configService.get<string>('LDAP_BIND_DN'),
          bindCredentials: configService.get<string>('LDAP_BIND_PW'),
          searchBase: configService.get<string>('LDAP_SEARCH_BASE'),
          searchFilter: configService.get<string>('LDAP_SEARCH_FILTER'),
          searchScope: 'sub' as Scope,
          groupSearchBase: configService.get<string>('LDAP_SEARCH_BASE'),
          groupSearchScope: 'sub' as Scope,
          groupSearchFilter: configService.get<string>('LDAP_SEARCH_GROUP'),
          groupDnProperty: 'dn',
          groupSearchAttributes: ldapADattributes,
          searchAttributes: ldapADattributes,
          searchBaseAllUsers: configService.get<string>('LDAP_SEARCH_BASE_ALL_USERS'),
          searchFilterAllUsers: configService.get<string>('LDAP_SEARCH_FILTER_ALL_USERS'),
          searchScopeAllUsers: 'sub' as Scope,
          searchAttributesAllUsers: ldapADattributes,
          reconnect: true,
          cache: true,
        } as LdapModuleOptions;
      },
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logger: LogService) =>
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
          logger,
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
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([ProfileEntity, GroupEntity, UserEntity]),
    // #endregion

    UserModule,

    ProfileModule,

    GroupModule,
  ],
  controllers: [AppController],
  providers: [SyncService, LoggingInterceptorProvider],
})
export class AppModule {}
