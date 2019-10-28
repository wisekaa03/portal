/** @format */

// #region Imports NPM
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    if (request && request.session && request.session.passport && request.session.passport.user) {
      return true;
    }

    throw new Error('Not found');
  }
}
