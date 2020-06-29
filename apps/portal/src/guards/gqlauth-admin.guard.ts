/** @format */

//#region Imports NPM
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
//#endregion
//#region Imports Local
//#endregion

@Injectable()
export class IsAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    if (request?.session?.passport?.user?.isAdmin) {
      return true;
    }

    throw new UnauthorizedException();
  }

  getResponse = (context: ExecutionContext): Express.Session => {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.res;
  };

  getRequest(context: ExecutionContext): Express.Session {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.req;
  }
}
