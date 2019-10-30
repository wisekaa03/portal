/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// #endregion
// #region Imports Local
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { Scope, ldapADattributes, LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
// #endregion

@Module({
  imports: [
    // #region Logger module, Config module, Next module
    LoggerModule,
    ConfigModule,
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

    // #region Passport module
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
    // #endregion

    // #region Users module
    UserModule,
    // #endregion
  ],
  providers: [AuthService, AuthResolver, LocalStrategy, CookieSerializer],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
