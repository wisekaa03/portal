/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LoggingInterceptor } from './logging.interceptor';
// #endregion

const interceptor = new LoggingInterceptor(new LogService());

describe('LoggingInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
