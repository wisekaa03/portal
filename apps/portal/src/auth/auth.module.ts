/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LdapModule, Scope, ldapADattributes, LdapModuleOptions } from 'nestjs-ldap';
import { UserModule } from '@back/user/user.module';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
// import { JwtStrategy } from './strategies/jwt.strategy';
//#endregion

@Module({
  imports: [
    //#region Passport module
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
    // JwtModule.registerAsync({
    //   useFactory: async () => {
    //     return {
    //       secret: ConfigService.jwtConstants.secret,
    //       signOptions: { expiresIn: '60s' },
    //     };
    //   },
    // }),
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
        newObject: configService.get<string>('LDAP_NEW_BASE'),
      }),
    }),
    //#endregion

    //#region Users module
    UserModule,
    //#endregion

    //#region HTTP service
    HttpModule,
    //#endregion

    SubscriptionsModule,
  ],
  providers: [AuthService, AuthResolver, LocalStrategy, CookieSerializer] /* , JwtStrategy */,
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
