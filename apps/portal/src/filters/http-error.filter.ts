/** @format */

// TODO: DEPRECATED: Next.JS is forwarding through RenderService -> setErrorHandler

// #region Imports NPM
import { ExceptionFilter, Catch, HttpException, HttpStatus, ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response, Request } from 'express';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
import { AppGraphQLExecutionContext } from '@app/logging.interceptor';
import { AUTH_PAGE } from '../../lib/constants';
// #endregion

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly logService: Logger) {}

  catch(exception: Error | HttpException, host: ArgumentsHost): void {
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

      if (status === 403) {
        response.status(302);
        response.redirect(AUTH_PAGE);
        return;
      }
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logService.error(`${request.method} ${request.url}`, exception.stack, 'ExceptionFilter');
      } else {
        this.logService.error(`${request.method} ${request.url}`, errorResponse, 'ExceptionFilter');
      }

      response.status(status);
      response.render('/_error');
      // #endregion
    } else {
      // #region GraphQL query
      const context: AppGraphQLExecutionContext = GqlExecutionContext.create(host as ExecutionContext);
      const info = context.getInfo();

      this.logService.error(`${info.parentType.name} "${info.fieldName}": ${message}`, undefined, 'ExceptionFilter');
      // #endregion
    }
  }
}
