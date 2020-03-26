/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { LdapService } from '@app/ldap';
import { UserService } from '@back/user/user.service';
import { AuthService } from './auth.service';
// #endregion

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: serviceMock },
        { provide: HttpService, useValue: serviceMock },
        { provide: LogService, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
