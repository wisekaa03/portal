/** @format */

// #region Imports NPM
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Request } from 'express';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
// #endregion

export type AppGraphQLExecutionContext = GraphQLExecutionContext;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  microserviceUrl: string;

  constructor(private readonly logger: LogService, private readonly configService: ConfigService) {
    this.microserviceUrl = configService.get<string>('MICROSERVICE_URL');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    switch (type) {
      case 'rpc': {
        const info = context.switchToRpc().getContext();

        return next.handle().pipe(
          tap(() =>
            this.logger.log(
              {
                info: info.args,
                url: this.microserviceUrl,
              },
              'NestMicroservice',
            ),
          ),
        );
      }

      case 'http':
      default: {
        const req = context.switchToHttp().getRequest<Request>();
        let username = (req?.session?.passport?.user as User)?.username || '';

        // HTTP requests
        if (req) {
          // const { method, url, socket } = req;

          return next.handle().pipe(tap(() => this.logger.log({ username }, context.getClass().name)));
        }

        // GraphQL requests
        const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
        const resolverName = ctx.getClass().name;
        const info = ctx.getInfo();
        const gqlCtx = ctx.getContext();
        // const address = gqlCtx?.req?.client?.remoteAddress;
        username = (gqlCtx?.req?.session?.passport?.user as User)?.username;

        const values = info.variableValues;
        if (values['password']) {
          values['password'] = '* MASKED *';
        }

        return next.handle().pipe(
          tap(() =>
            this.logger.log(
              {
                username,
                parentType: info.parentType.name,
                fieldName: info.fieldName,
                values: Object.keys(values).length > 0 && values,
              },
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
