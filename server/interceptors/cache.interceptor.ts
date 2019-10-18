/** @format */

// #region Imports NPM
import { ExecutionContext, Injectable, CacheInterceptor as MainCacheInterceptor } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CacheInterceptor extends MainCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // if (context.switchToHttp().getRequest()) {
    //   return super.trackBy(context);
    // }

    return undefined;
  }
}
