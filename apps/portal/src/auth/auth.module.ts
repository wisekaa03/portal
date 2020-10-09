/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LdapModule, Scope, ldapADattributes } from 'nestjs-ldap';
import { RedisService } from 'nestjs-redis';
import type { Redis } from 'ioredis';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { TIMEOUT } from '@back/shared/constants';
import { UserModule } from '@back/user/user.module';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CookieSerializer } from './cookie.serializer';
import { LocalStrategy } from './strategies/local.strategy';
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
      inject: [ConfigService, RedisService],
      useFactory: async (configService: ConfigService, redisService: RedisService) => {
        let cache: Redis | undefined;
        try {
          cache = redisService.getClient('LDAP');
        } catch {
          cache = undefined;
        }
        return {
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
          cache,
          newObject: configService.get<string>('LDAP_NEW_BASE'),
        };
      },
    }),
    //#endregion

    //#region Users module
    UserModule,
    //#endregion

    //#region HTTP service
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: TIMEOUT,
      }),
    }),
    //#endregion

    SubscriptionsModule,
  ],
  providers: [AuthService, AuthResolver, LocalStrategy, CookieSerializer] /* , JwtStrategy */,
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
