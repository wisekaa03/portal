/** @format */

//#region Imports NPM
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
//#endregion

export type AppGraphQLExecutionContext = GraphQLExecutionContext;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  microserviceUrl: string;

  constructor(
    @InjectPinoLogger(LoggingInterceptor.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.microserviceUrl = configService.get<string>('MICROSERVICE_URL');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    switch (type) {
      case 'rpc': {
        const info = context.switchToRpc().getContext();

        return next.handle().pipe(
          tap(() =>
            this.logger.info(
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
        const request = context.switchToHttp().getRequest<Request>();
        let username = '';

        // HTTP requests
        if (request) {
          username = (request.session?.passport?.user as User)?.username || '';

          return next.handle().pipe(tap(() => this.logger.info({ username }, context.getClass().name)));
        }

        // GraphQL requests
        const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
        const resolverName = ctx.getClass().name;
        const info = ctx.getInfo();
        const gqlCtx = ctx.getContext();
        username = (gqlCtx.req?.session?.passport?.user as User)?.username || '';

        const values = info.variableValues;
        if (values['password']) {
          values['password'] = '* MASKED *';
        }

        return next.handle().pipe(
          tap(() =>
            this.logger.info(
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
  //#region Logging interceptor
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  };
//#endregion
