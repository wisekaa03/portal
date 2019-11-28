/** @format */

// #region Imports NPM
import * as CacheManager from 'cache-manager';
// #endregion
// #region Imports Local
import { CacheInterceptor } from './cache.interceptor';
// #endregion

jest.mock('@nestjs/common/cache/interceptors/cache.interceptor');
jest.mock('cache-manager');

describe('CacheInterceptor', () => {
  it('should be defined', () => {
    expect(new CacheInterceptor(CacheManager, {})).toBeDefined();
  });
});
