/** @format */
/* eslint spaced-comment:0, prettier/prettier:0 */
/// <reference types="../../../typings/global" />

// #region Imports NPM
import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LdapModule, Scope, ldapADattributes, LdapModuleOptions } from '@app/ldap';
import { LoggerModule, LogService } from '@app/logger';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { AppController } from './app.controller';
import { SynchService } from './app.service';
import { UserModule } from '../../portal/src/user/user.module';
import { UserEntity } from '../../portal/src/user/user.entity';
import { ProfileEntity } from '../../portal/src/profile/profile.entity';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

@Module({
  imports: [
    // #region Config & Log module
    ConfigModule.register(env),
    LoggerModule,
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
          searchAttributes: ldapADattributes,
          searchBaseAllUsers: configService.get<string>('LDAP_SEARCH_BASE_ALL_USERS'),
          searchFilterAllUsers: configService.get<string>('LDAP_SEARCH_FILTER_ALL_USERS'),
          searchScopeAllUsers: 'sub' as Scope,
          searchAttributesAllUsers: ldapADattributes,
          queueSize: 100,
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
          type: configService.get<string>('DATABASE_CONNECTION'),
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_DATABASE'),
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
          entities: [ProfileEntity, UserEntity],
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
          // migrations,
          // cli: {
          //   migrationsDir: 'migration',
          // },
        } as TypeOrmModuleOptions),
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([ProfileEntity, UserEntity]),
    // #endregion

    UserModule,
  ],
  controllers: [AppController],
  providers: [SynchService, LoggingInterceptorProvider],
})
export class AppModule {}
