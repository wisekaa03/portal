/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
// #endregion

jest.mock('./auth.service');
jest.mock('../guards/gqlauth.guard');
jest.mock('@app/logger/logger.service', () => ({
  LogService: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));
// jest.mock('@app/config/config.service');

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [AuthResolver, AuthService],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
