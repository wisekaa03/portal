/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { Logger } from '@app/logger';
import { LdapService } from './ldap.service';
import { LdapModule } from './ldap.module';
import { LdapModuleOptions } from './ldap.interface';
// #endregion

const serviceMock = jest.fn(() => ({}));

jest.mock('cache-manager');
jest.mock('cache-manager-redis-store', () => ({
  create: jest.fn(),
}));
jest.mock('ldapjs', () => ({
  createClient: () => ({
    on: jest.fn(),
  }),
}));

jest.mock('@app/config/config.service');

describe('LdapService', () => {
  let ldap: LdapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register('.env'),
        LoggerModule.forRoot(),

        LdapModule.registerAsync({
          useFactory: () => {
            return {} as LdapModuleOptions;
          },
        }),
      ],
      providers: [{ provide: Logger, useValue: serviceMock }],
    }).compile();

    ldap = module.get<LdapService>(LdapService);
  });

  it('should be defined', () => {
    expect(ldap).toBeDefined();
  });
});
