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
            const { httpAdapter } = this.httpAdapterHost;
            const httpServer = httpAdapter.getHttpServer();

            return httpServer.getRequestUrl(req);
          }
        }
        break;

      default:
    }

    // const { httpAdapter } = this.httpAdapterHost;
    // const httpServer = httpAdapter.getHttpServer();

    // const isGetRequest = httpServer.getRequestMethod(request) === 'GET';
    // const excludePaths = ['/graphql'];
    // if (!isGetRequest || (isGetRequest && excludePaths.includes(httpServer.getRequestUrl))) {
    //   return undefined;
    // }
    // return httpServer.getRequestUrl(request);

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
