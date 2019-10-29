/** @format */

// #region Imports NPM
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Express.Request>();

    if (request && request.session && request.session.passport && request.session.passport.user) {
      return true;
    }

    context
      .switchToHttp()
      .getResponse()
      .status(403);

    return false;
  }
}
