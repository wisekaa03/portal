/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { PinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
import { ConfigService } from '@app/config/config.service';
import { LoggingInterceptor } from './logging.interceptor';
// #endregion

jest.mock('@app/config/config.service', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

const interceptor = new LoggingInterceptor(new Logger(new PinoLogger({}), {}), new ConfigService(resolve('.env')));

describe('LoggingInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
