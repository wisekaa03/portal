/** @format */

// #region Imports NPM
import { ExceptionFilter, Catch, HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
// #endregion
// #region Imports Local
import { NextService } from '../next/next.service';
import { AppGraphQLExecutionContext } from '../interceptors/logging.interceptor';
import { LoggerService } from '../logger/logger.service';
// #endregion

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly nextService: NextService, private readonly loggerService: LoggerService) {}

  catch(exception: Error | HttpException | JsonWebTokenError | TokenExpiredError, host: ExecutionContext): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
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
        this.loggerService.error(`${request.method} ${request.url}`, exception.stack, 'ExceptionFilter');
      } else {
        this.loggerService.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');
      }

      response.status(status);

      if (request.url.startsWith('/api/')) {
        response.json(errorResponse);
      } else {
        this.nextService.error(request, response, status, exception);
      }
      // #endregion
    } else {
      // #region GraphQL query
      const context: AppGraphQLExecutionContext = GqlExecutionContext.create(host);
      const info = context.getInfo();

      this.loggerService.error(`${info.parentType.name} "${info.fieldName}": ${message}`, undefined, 'ExceptionFilter');
      // #endregion
    }
  }
}
