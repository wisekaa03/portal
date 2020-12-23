/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, Logger } from '@nestjs/common';
import { LdapService } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { UserService } from '../user';
import { ConfigService } from '../../../../libs/config/src';
import { AuthService } from './auth.service';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(AuthService.name, () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        { provide: 'PUB_SUB', useValue: serviceMock },
        ConfigService,
        AuthService,
        { provide: Logger, useValue: serviceMock },
        { provide: HttpService, useValue: serviceMock },
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
