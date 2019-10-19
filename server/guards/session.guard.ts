/** @format */

// #region Imports NPM
import { IncomingMessage } from 'http';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class SessionAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor() {
    super({ session: true });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx: any = gqlContext.getContext();

    let canActivate: boolean | Observable<boolean>;

    // eslint-disable-next-line no-debugger
    // debugger;

    if (gqlCtx instanceof Function) {
      canActivate = await super.canActivate(context);
    } else {
      gqlContext.switchToHttp = () => (this as unknown) as HttpArgumentsHost;
      canActivate = await super.canActivate(gqlContext);
    }

    // eslint-disable-next-line no-debugger
    // debugger;

    await super.logIn(gqlContext.switchToHttp().getRequest());

    return canActivate instanceof Observable ? canActivate.toPromise() : canActivate;
  }

  handleRequest(err: Error, user: any /* , info: any, context: any */): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }

  getResponse = (): any => undefined;

  getRequest(context: ExecutionContext): IncomingMessage {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);

    // eslint-disable-next-line no-debugger
    // debugger;

    if (gqlContext.getContext() instanceof Function) {
      return context.switchToHttp().getRequest();
    }
    return gqlContext.getContext().req;
  }
}
