/** @format */

// #region Imports NPM
import * as CacheManager from 'cache-manager';
import { PinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { HttpCacheInterceptor } from './cache.interceptor';
// #endregion

jest.mock('@nestjs/common/cache/interceptors/cache.interceptor');
jest.mock('cache-manager');

describe('CacheInterceptor', () => {
  it('should be defined', () => {
    expect(new HttpCacheInterceptor(CacheManager, {}, new PinoLogger({}))).toBeDefined();
  });
});
