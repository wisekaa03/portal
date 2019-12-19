/** @format */

// #region Imports NPM
import * as CacheManager from 'cache-manager';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger/logger.service';
import { HttpCacheInterceptor } from './cache.interceptor';
// #endregion

jest.mock('@app/logger/logger.service');
jest.mock('@nestjs/common/cache/interceptors/cache.interceptor');
jest.mock('cache-manager');

describe('CacheInterceptor', () => {
  it('should be defined', () => {
    expect(new HttpCacheInterceptor(CacheManager, {}, new LogService())).toBeDefined();
  });
});
