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
export class GqlAuthGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);

    gqlContext.switchToHttp = () => (this as unknown) as HttpArgumentsHost;
    const canActivate = await super.canActivate(gqlContext);

    return canActivate instanceof Observable ? canActivate.toPromise() : canActivate;
  }

  getResponse = (): any => undefined;

  getRequest(context: ExecutionContext): IncomingMessage {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.req;
  }
}
