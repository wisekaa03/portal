/** @format */

//#region Imports NPM
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@lib/types/user.dto';
//#endregion

export const getUsername = (request: Request): { username: string } => ({ username: request?.user?.username });

export const CurrentUser = createParamDecorator<any, any, User | undefined>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext()?.req?.user,
);

/**
 * TODO: !!! This is a security RISK !!!
 */
export const PasswordFrontend = createParamDecorator<any, any, string | undefined>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext()?.req?.session?.password,
);
