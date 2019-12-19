/** @format */

// #region Imports NPM
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionContext, Injectable, CacheInterceptor as MainCacheInterceptor } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CacheInterceptor extends MainCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const type = context.getType();

    switch (type) {
      case 'http':
        {
          const req = context.switchToHttp().getRequest<Request>();

          if (req && req.method === 'GET') {
            return `${req.url}#${req.headers.cookie}`;
          }
        }
        break;

      default:
    }

    return undefined;
  }
}

export const CacheInterceptorProvider =
  // #region Cache interceptor
  {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
  };
// #endregion
