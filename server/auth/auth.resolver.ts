/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { UserResponse } from '../user/models/user.dto';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { AuthService } from './auth.service';
import { LogService } from '../logger/logger.service';
// #endregion

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private readonly logService: LogService) {}

  /**
   * GraphQL query: me
   *
   * @param req - request.User
   * @returns {UserResponseDTO}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@Context('req') req: Request): Promise<UserResponse | null> {
    return req.user as UserResponse;
  }

  /**
   * GraphQL mutation: login
   *
   * @param username - username
   * @param password - password
   * @returns {UserResponseDTO}
   */
  @Mutation()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: any,
  ): Promise<UserResponse | null> {
    return this.authService.login({ username, password });
  }

  // /**
  //  * GraphQL mutation: logout
  //  *
  //  * @returns {UserResponseDTO}
  //  */
  // @Mutation()
  // async logout(_: any, __: any): Promise<boolean> {
  //   return this.authService.logout();
  // }
}
