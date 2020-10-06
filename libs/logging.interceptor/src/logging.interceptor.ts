/** @format */

//#region Imports NPM
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
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
    const type = context.getType();
    switch (type) {
      case 'rpc': {
        const info = context.switchToRpc().getContext();

        return call$.handle().pipe(tap(() => this.logger.log({ page: this.ctxPrefix, info: info.args }, 'NestMicroservice')));
      }

      case 'http':
      default: {
        let username = '';
        const req: Request = context.switchToHttp().getRequest();

        // HTTP requests
        if (req) {
          const { method, url, body, headers } = req;
          const message = `Incoming request - ${method} - ${url}`;
          username = (req.session?.passport?.user as User)?.username || '';

          if (url !== '/health') {
            this.logger.log(
              {
                page: this.ctxPrefix,
                message,
                method,
                body,
                headers,
                username,
              },
              this.ctxPrefix,
            );
          }

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

        const ctx: AppGraphQLExecutionContext = GqlExecutionContext.create(context);
        const resolverName = ctx.getClass().name;
        const info = ctx.getInfo();
        const gqlCtx = ctx.getContext();
        username = (gqlCtx.req?.session?.passport?.user as User)?.username || '';

        const values = info.variableValues;
        if (values.password) {
          values.password = '* MASKED *';
        }

        return call$.handle().pipe(
          tap(() =>
            this.logger.log(
              {
                page: this.ctxPrefix,
                username,
                parentType: info.parentType.name,
                fieldName: info.fieldName,
                values: `${Object.keys(values).length > 0 ? values.toString() : ''}`,
              },
              resolverName,
            ),
          ),
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
    const { method, url } = req;
    if (url !== '/health') {
      const res: Response = context.switchToHttp().getResponse<Response>();
      const { statusCode } = res;
      const username = (req?.session?.passport?.user as User)?.username || '';
      const message = `Outgoing response - ${statusCode} - ${method} - ${url}`;

      this.logger.log(
        {
          page: this.ctxPrefix,
          message,
          body,
          statusCode,
          username,
        },
        this.ctxPrefix,
      );
    }
  }

  /**
   * Logs the request response in success cases
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = req;

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      const message = `Outgoing response - ${statusCode} - ${method} - ${url}`;

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
          },
          this.ctxPrefix,
        );
      }
    } else {
      this.logger.error(
        {
          page: this.ctxPrefix,
          message: `Outgoing response - ${method} - ${url}`,
        },
        error.stack,
        this.ctxPrefix,
      );
    }
  }
}
