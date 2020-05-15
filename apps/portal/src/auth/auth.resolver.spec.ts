/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config/config.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
// #endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe(AuthResolver.name, () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        AuthResolver,
        ConfigService,
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
