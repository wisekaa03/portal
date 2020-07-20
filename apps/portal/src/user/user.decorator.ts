/** @format */

//#region Imports NPM
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@lib/types/user.dto';
//#endregion

export const CurrentUser = createParamDecorator<any, any, User | undefined>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext()?.req?.user,
);

/**
 * TODO: !!! This is a security RISK !!!
 */
export const PasswordFrontend = createParamDecorator<any, any, string | undefined>(
  (_data: unknown, context: ExecutionContext) =>
    GqlExecutionContext.create(context).getContext()?.req?.session?.password,
);
