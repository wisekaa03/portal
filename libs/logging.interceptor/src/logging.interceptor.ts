/** @format */

//#region Imports NPM
import { CallHandler, ContextType, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
//#endregion

export type AppGraphQLExecutionContext = GraphQLExecutionContext;

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = LoggingInterceptor.name;
  private readonly logger: Logger = new Logger(this.ctxPrefix);

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param call$ implements the handle method that returns an Observable
   */
  public intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {
    const type = context.getType<'graphql' | ContextType>();
    switch (type) {
      case 'rpc': {
        const info = context.switchToRpc().getContext();

        return call$.handle().pipe(tap(() => this.logger.log({ page: this.ctxPrefix, info: info.args }, 'NestMicroservice')));
      }

      case 'http': {
        const req: Request = context.switchToHttp().getRequest();

        const { method, url, body, headers } = req;
        const message = `Incoming request: Method: ${method}, URL: ${url}`;
        const username = req?.user?.username || '';

        if (url === '/health') {
          return call$.handle();
        }

        try {
          this.logger.log(
            {
              page: this.ctxPrefix,
              message,
              method,
              body,
              headers,
              username,
              function: context.getHandler().name,
            },
            this.ctxPrefix,
          );
          // eslint-disable-next-line no-empty
        } catch {}

        return call$.handle().pipe(
          tap({
            next: (val: unknown): void => {
              this.logNext(val, context);
            },
            error: (err: Error): void => {
              this.logError(err, context);
            },
          }),
        );
      }

      case 'graphql':
      default: {
        const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
        const resolverName = ctx.getClass().name;
        const info = ctx.getInfo();
        const gqlCtx = ctx.getContext();
        const values = info.variableValues;
        const username = values.username ? values.username : gqlCtx.user?.username || '';
        const message = `Incoming GraphQL ${resolverName} ${info.operation.operation} ${info.fieldName}`;

        if (values.password) {
          values.password = '* MASKED *';
        }

        return call$.handle().pipe(
          tap(() => {
            try {
              this.logger.log(
                {
                  message,
                  page: this.ctxPrefix,
                  username,
                  operation: info.operation.operation,
                  fieldName: info.fieldName,
                  values: `${Object.keys(values).length > 0 ? JSON.stringify(values) : ''}`,
                  function: context.getHandler().name,
                },
                resolverName,
              );
              // eslint-disable-next-line no-empty
            } catch {}
          }),
        );
      }
    }
  }

  /**
   * Logs the request response in success cases
   * @param body body returned
   * @param context details about the current request
   */
  private logNext(body: unknown, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url, user } = req;
    const username = user?.username || '';

    const res: Response = context.switchToHttp().getResponse<Response>();
    const { statusCode } = res;
    const message = `Outgoing response: statusCode: ${statusCode}, Method: ${method}, URL: ${url}`;

    try {
      this.logger.log(
        {
          page: this.ctxPrefix,
          message,
          body,
          statusCode,
          username,
          function: context.getHandler().name,
        },
        this.ctxPrefix,
      );
      // eslint-disable-next-line no-empty
    } catch {}
  }

  /**
   * Logs the request response in success cases
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, user } = req;

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      const message = `Outgoing response: statusCode: ${statusCode}, Method: ${method}, URL: ${url}`;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          {
            page: this.ctxPrefix,
            statusCode,
            method,
            url,
            body,
            message,
            error,
            username: user?.username,
          },
          error.stack,
          this.ctxPrefix,
        );
      } else {
        this.logger.warn(
          {
            page: this.ctxPrefix,
            method,
            url,
            error,
            body,
            message,
            username: user?.username,
          },
          this.ctxPrefix,
        );
      }
    } else {
      this.logger.error(
        {
          page: this.ctxPrefix,
          message: `Outgoing response: Method: ${method}, URL: ${url}`,
          username: user?.username,
        },
        error.stack,
        this.ctxPrefix,
      );
    }
  }
}
