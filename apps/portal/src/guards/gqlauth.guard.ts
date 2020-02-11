/** @format */

// #region Imports NPM
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class GqlAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    return !!request?.session?.passport?.user;
  }

  getResponse = (): any => undefined;

  getRequest(context: ExecutionContext): Express.Session {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.req;
  }
}
