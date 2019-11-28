/** @format */

// #region Imports NPM
import { resolve } from 'path';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config/config.service';
import { LoggingInterceptor } from './logging.interceptor';
// #endregion

jest.mock('@app/config/config.service', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

const interceptor = new LoggingInterceptor(new LogService(), new ConfigService(resolve('.env')));

describe('LoggingInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
