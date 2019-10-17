/** @format */

// #region Imports NPM
import { ExecutionContext, Injectable, CacheInterceptor as MainCacheInterceptor } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CacheInterceptor extends MainCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (context.switchToHttp().getRequest()) {
      return super.trackBy(context);
    }

    return undefined;
  }
}
