/** @format */

// #region Imports NPM
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Type } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// #endregion
// #region Imports Local
import { LogService } from '../logger/logger.service';
// #endregion

export interface AppGraphQLExecutionContext extends GraphQLExecutionContext {
  constructorRef?: Type<any>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    // eslint-disable-next-line no-debugger
    // debugger;

    if (req) {
      const { method, url } = req;

      return next
        .handle()
        .pipe(tap(() => this.logService.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name)));
    }

    const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
    const resolverName = ctx.constructorRef && ctx.constructorRef.name;
    const info = ctx.getInfo();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logService.log(`${info.parentType.name} "${info.fieldName}" ${Date.now() - now}ms`, resolverName),
        ),
      );
  }
}
