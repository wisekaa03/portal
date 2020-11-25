/** @format */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config/config.service';
import { UserService } from '@back/user/user.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe(AuthResolver.name, () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: 'PUB_SUB',
          useValue: serviceMock,
        },
        AuthResolver,
        ConfigService,
        { provide: Logger, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: AuthService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
