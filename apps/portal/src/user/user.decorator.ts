/** @format */

//#region Imports NPM
import type { Request } from 'express';
import { User } from '@back/user/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
//#endregion

export const getUsername = (request: Request): { username: string } => ({ username: request?.user?.username ?? 'unknown' });

export const CurrentUser = createParamDecorator<any, any, User>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext()?.req?.user ?? {},
);

/**
 * @todo: !!! This is a security RISK !!!
 */
export const PasswordFrontend = createParamDecorator<any, any, string>(
  (_data: unknown, context: ExecutionContext) => GqlExecutionContext.create(context).getContext()?.req?.session?.password ?? '',
);
