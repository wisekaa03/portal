/** @format */

// #region Imports NPM
// import { Socket, AddressInfo } from 'net';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Type } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config/config.service';
// #endregion

export interface AppGraphQLExecutionContext extends GraphQLExecutionContext {
  constructorRef?: Type<any>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  microserviceUrl: string;

  constructor(private readonly logService: LogService, private readonly configService: ConfigService) {
    this.microserviceUrl = configService.get<string>('MICROSERVICE_URL');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const type = context.getType();

    switch (type) {
      case 'rpc': {
        const info = context.switchToRpc().getContext();

        return next
          .handle()
          .pipe(
            tap(() =>
              this.logService.log(
                `${JSON.stringify(info.args)} - ${this.microserviceUrl} - ${Date.now() - now}ms`,
                'NestMicroservice',
              ),
            ),
          );
      }

      case 'http':
      default: {
        const req = context.switchToHttp().getRequest();

        if (req) {
          const { method, url, client } = req;

          return next
            .handle()
            .pipe(
              tap(() =>
                this.logService.log(
                  `${method} ${url} - ${client.remoteAddress} - ${Date.now() - now}ms`,
                  context.getClass().name,
                ),
              ),
            );
        }

        const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
        const resolverName = ctx.constructorRef && ctx.constructorRef.name;
        const info = ctx.getInfo();
        const gqlCtx = ctx.getContext();
        const address = gqlCtx.req && gqlCtx.req.client && gqlCtx.req.client.remoteAddress;

        const values = info.variableValues;
        if (values['password']) {
          values['password'] = '* MASKED *';
        }

        return next
          .handle()
          .pipe(
            tap(() =>
              this.logService.log(
                `${info.parentType.name} "${info.fieldName}": ${JSON.stringify(values)} - ${address} - ${Date.now() -
                  now}ms`,
                resolverName,
              ),
            ),
          );
      }
    }
  }
}

export const LoggingInterceptorProvider =
  // #region Logging interceptor
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  };
// #endregion
