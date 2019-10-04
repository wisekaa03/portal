/** @format */

// #region Imports NPM
// import { IncomingMessage } from 'http';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
// import { AuthService } from '../auth/auth.service';
// #endregion

@Injectable()
export class SessionAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(/* private readonly authService: AuthService */) {
    super({ session: true });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line no-debugger
    debugger;

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);

    if (request.session && request.session.passport && request.session.passport.user) {
      return true;
    }

    return result;
  }

  handleRequest(err: Error, user: any /* , info: any, context: any */): any {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
