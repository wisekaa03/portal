/** @format */

// #region Imports NPM
import * as CacheManager from 'cache-manager';
// #endregion
// #region Imports Local
import { MyCacheInterceptor } from './cache.interceptor';
// #endregion

jest.mock('cache-manager');

describe('CacheInterceptor', () => {
  it('should be defined', () => {
    expect(new MyCacheInterceptor(CacheManager, {})).toBeDefined();
  });
});
