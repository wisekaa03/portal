/** @format */

// #region Imports NPM
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionContext, Injectable, CacheInterceptor } from '@nestjs/common';
import { CACHE_KEY_METADATA } from '@nestjs/common/cache/cache.constants';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger/logger.service';
// #endregion

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  constructor(cacheManager: any, reflector: any, private readonly logService: LogService) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const type = context.getType();

    if (type === 'http') {
      const { httpAdapter } = this.httpAdapterHost;
      const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
      const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
      if (!isHttpApp || cacheMetadata) {
        return cacheMetadata;
      }

      const req = context.switchToHttp().getRequest<Request>();

      if (req && req.method === 'GET') {
        this.logService.log(`Cache: "${req.url}". Session: "${req.session && req.session.id}"`, 'CacheInterceptor');

        return httpAdapter.getRequestUrl(req);
      }
    }

    return undefined;
  }
}

export const CacheInterceptorProvider =
  // #region Cache interceptor
  {
    provide: APP_INTERCEPTOR,
    useClass: HttpCacheInterceptor,
  };
// #endregion
