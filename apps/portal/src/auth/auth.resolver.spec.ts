/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
// #endregion

const AuthServiceMock = jest.fn(() => ({}));

jest.mock('@app/ldap/ldap.service');
jest.mock('../shared/session-redis');
jest.mock('./auth.service');
jest.mock('../user/user.service');
jest.mock('../guards/gqlauth.guard');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule, ConfigModule.register(env)],
      providers: [AuthResolver, { provide: AuthService, useValue: AuthServiceMock }],
    })
      .overrideProvider(AuthService)
      .useValue(AuthServiceMock)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
