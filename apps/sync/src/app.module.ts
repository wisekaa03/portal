/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { LdapModule, Scope, ldapADattributes } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { LoggingInterceptor } from '@app/logging.interceptor';
import { winstonOptions } from '@back/shared/logger.options';
import { UserModule } from '@back/user/user.module';
import { User } from '@back/user/user.entity';
import { ProfileModule } from '@back/profile/profile.module';
import { Profile } from '@back/profile/profile.entity';
import { GroupModule } from '@back/group/group.module';
import { Group } from '@back/group/group.entity';
import { TypeOrmLogger } from '@back/shared/typeorm.logger';

import { ConfigModule, ConfigService, LDAPDomainConfig } from '@app/config';

import { AppController } from './app.controller';
import { SyncService } from './app.service';
//#endregion

const environment = resolve(__dirname, '../../..', '.local/.env');

@Module({
  imports: [
    //#region Config & Log module
    ConfigModule.register(environment),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => winstonOptions(configService),
    }),
    //#endregion

    //#region LDAP Module
    LdapModule.registerAsync({
      inject: [ConfigService, WINSTON_MODULE_PROVIDER],
      useFactory: async (configService: ConfigService, logger: WinstonLogger) => {
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
          reconnect: false,
          newObject: domainsConfig[name].newBase,
        }));

        return {
          domains,
          logger,
        };
      },
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      useFactory: async (configService: ConfigService, logger: WinstonLogger) =>
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
          entities: [Profile, Group, User],
          migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
          cache: false,
        } as TypeOrmModuleOptions),
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forFeature([Profile, Group, User]),
    //#endregion

    GroupModule,
    UserModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [Logger, SyncService, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
