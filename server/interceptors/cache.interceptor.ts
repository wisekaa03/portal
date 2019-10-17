/** @format */

// #region Imports NPM
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Inject,
  NestInterceptor,
  CacheInterceptor,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
// #endregion

const REFLECTOR = 'Reflector';

@Injectable()
export class MyCacheInterceptor implements NestInterceptor {
  public cacheInterceptor: CacheInterceptor;

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  constructor(@Inject(CACHE_MANAGER) protected readonly cacheManager: any, @Inject(REFLECTOR) reflector: any) {
    // eslint-disable-next-line no-debugger
    debugger;

    this.cacheInterceptor = new CacheInterceptor(cacheManager, reflector);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // eslint-disable-next-line no-debugger
    debugger;

    return next.handle();
  }
}
