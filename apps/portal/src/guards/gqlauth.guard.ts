/** @format */

//#region Imports NPM
import { Request, Response } from 'express';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
//#endregion

@Injectable()
export class GqlAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.getUser(context)) {
      return true;
    }

    throw new UnauthorizedException();
  }

  getUser = (context: ExecutionContext): User | undefined => {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx?.user as User;
  };

  getResponse = (context: ExecutionContext): Response | undefined => {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx?.res as Response;
  };

  getRequest = (context: ExecutionContext): Request | undefined => {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx?.req as Request;
  };
}
