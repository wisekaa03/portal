/** @format */

// #region Imports NPM
import { ExecutionContext, Injectable, CacheInterceptor as MainCacheInterceptor } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CacheInterceptor extends MainCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // const request = context.switchToHttp().getRequest();
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
