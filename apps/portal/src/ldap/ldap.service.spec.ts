/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { LdapService } from './ldap.service';
import { LdapModule } from './ldap.module';
import { LdapModuleOptions, Scope, ldapADattributes } from './ldap.interface';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
// #endregion

describe('LdapService', () => {
  let ldap: LdapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(resolve(__dirname, '../../../..', '.env')),

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
      ],
      providers: [],
    }).compile();

    ldap = module.get<LdapService>(LdapService);
  });

  it('should be defined', () => {
    expect(ldap).toBeDefined();
  });
});
