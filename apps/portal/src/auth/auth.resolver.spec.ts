/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
import { ConfigService } from '@app/config';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
// #endregion

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

// jest.mock('../guards/gqlauth.guard');

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthResolver,
        { provide: ConfigService, useValue: serviceMock },
        { provide: Logger, useValue: serviceMock },
        { provide: AuthService, useValue: serviceMock },
        { provide: I18nService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
