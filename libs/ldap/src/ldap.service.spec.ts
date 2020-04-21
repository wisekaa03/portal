/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { LdapService } from './ldap.service';
import { LDAP_OPTIONS } from './ldap.interface';
// #endregion

jest.mock('@app/config/config.service');
jest.mock('@app/logger/log.service');

jest.mock('cache-manager');
jest.mock('cache-manager-redis-store', () => ({
  create: jest.fn(),
}));
jest.mock('ldapjs', () => ({
  createClient: () => ({
    on: jest.fn(),
  }),
}));

// const serviceMock = jest.fn(() => ({}));

describe(LdapService.name, () => {
  let ldap: LdapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: LDAP_OPTIONS, useValue: {} }, ConfigService, LogService, LdapService],
    }).compile();

    ldap = module.get<LdapService>(LdapService);
  });

  it('should be defined', () => {
    expect(ldap).toBeDefined();
  });
});
