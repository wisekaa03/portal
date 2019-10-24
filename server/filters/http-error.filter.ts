/** @format */

// #region Imports NPM
import { ExceptionFilter, Catch, HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { AppGraphQLExecutionContext } from '../interceptors/logging.interceptor';
import { LogService } from '../logger/logger.service';
// #endregion

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}

  catch(exception: Error | HttpException | JsonWebTokenError | TokenExpiredError, host: ExecutionContext): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<NextResponse>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
      if (typeof message === 'object') {
        message = (message as any).error;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      ({ message } = exception);
    }

    if (response.status && request.method && request.url) {
      // #region HTTP query
      const errorResponse = {
        code: status,
        timestamp: new Date().toLocaleString('ru'),
        path: request.url,
        method: request.method,
        message,
      };

      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logService.error(`${request.method} ${request.url}`, exception.stack, 'ExceptionFilter');
      } else {
        this.logService.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');
      }

      response.status(status);
      response.nextRender('/_error');
      // #endregion
    } else {
      // #region GraphQL query
      const context: AppGraphQLExecutionContext = GqlExecutionContext.create(host);
      const info = context.getInfo();

      this.logService.error(`${info.parentType.name} "${info.fieldName}": ${message}`, undefined, 'ExceptionFilter');
      // #endregion
    }
  }
}
