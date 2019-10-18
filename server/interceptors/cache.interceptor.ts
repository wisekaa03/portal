/** @format */

// #region Imports NPM
import { ExecutionContext, Injectable, CacheInterceptor as MainCacheInterceptor } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class CacheInterceptor extends MainCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // TODO: сделать чтобы cache по страницам с типом GET обрабатывался cache
    // TODO: а все остальные, в частности graphql запросы нормально обрабатывались
    // if (context.switchToHttp().getRequest()) {
    //   return super.trackBy(context);
    // }

    return undefined;
  }
}
