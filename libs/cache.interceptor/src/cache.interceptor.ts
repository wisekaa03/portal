/** @format */

//#region Imports NPM
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExecutionContext, Injectable, CacheInterceptor } from '@nestjs/common';
import { CACHE_KEY_METADATA } from '@nestjs/common/cache/cache.constants';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Request } from 'express';
//#endregion
//#region Imports Local
//#endregion

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  constructor(
    cacheManager: any,
    reflector: any,
    @InjectPinoLogger(HttpCacheInterceptor.name) private readonly logger: PinoLogger,
  ) {
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
        // TODO: доделать все-таки кэш, не получается из-за связки nest с next, разобраться
        // this.logger.log(`Cache: "${req.url}". Session: "${req.session && req.session.id}"`,
        //      HttpCacheInterceptor.name);
        // const url = httpAdapter.getRequestUrl(req);
        // return `${url}$${req.headers.cookie}`;
      }
    }

    return undefined;
  }
}

export const CacheInterceptorProvider =
  //#region Cache interceptor
  {
    provide: APP_INTERCEPTOR,
    useClass: HttpCacheInterceptor,
  };
//#endregion
