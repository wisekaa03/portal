/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoggingInterceptor } from './logging.interceptor';
import { LogService } from '../logger/logger.service';
// #endregion

jest.mock('../logger/logger.service');

const interceptor = new LoggingInterceptor(new LogService());

describe('LoggingInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
