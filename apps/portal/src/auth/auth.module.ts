/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LdapModule, Scope, ldapADattributes, LdapModuleOptions } from '@app/ldap';
import { UserModule } from '@back/user/user.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
// import { JwtStrategy } from './strategies/jwt.strategy';
// #endregion

@Module({
  imports: [
    // #region Logger module, Config module
    LoggerModule,
    ConfigModule,
    // #endregion

    // #region Passport module
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
    // JwtModule.registerAsync({
    //   useFactory: async () => {
    //     return {
    //       secret: ConfigService.jwtConstants.secret,
    //       signOptions: { expiresIn: '60s' },
    //     };
    //   },
    // }),
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
          groupSearchFilter: configService.get<string>('LDAP_SEARCH_GROUP'),
          groupSearchScope: 'sub' as Scope,
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

    // #region Users module
    UserModule,
    // #endregion

    // #region HTTP service
    HttpModule,
    // #endregion
  ],
  providers: [AuthService, AuthResolver, LocalStrategy, CookieSerializer /* , JwtStrategy */],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
