/** @format */

//#region Imports NPM
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@lib/types/user.dto';
//#endregion

export const CurrentUser = createParamDecorator<any, any, User>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext().req.user || undefined,
);

/**
 * TODO: !!! This is a security RISK !!!
 */
export const PasswordFrontend = createParamDecorator<any, any, string>(
  (_data: unknown, context: ExecutionContext) =>
    GqlExecutionContext.create(context).getContext().req?.session?.password || undefined,
);
