/** @format */

// #region Imports NPM
import {
  Resolver,
  Query,
  Args,
  // ResolveProperty,
  // Parent,
  Mutation,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { UserResponseDTO } from './models/user.dto';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
// #endregion

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * GraphQL query: me
   *
   * @param req - request.User
   * @returns {UserResponseDTO}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@Context('req') req: Request): Promise<UserResponseDTO | null> {
    // eslint-disable-next-line no-debugger
    debugger;

    return req.user as UserResponseDTO;
  }

  /**
   * GraphQL mutation: login
   *
   * @param username - username
   * @param password - password
   * @returns {UserResponseDTO}
   */
  @Mutation()
  async login(@Args('username') username: string, @Args('password') password: string): Promise<UserResponseDTO | null> {
    // eslint-disable-next-line no-debugger
    debugger;

    return this.userService.login({ username, password });
  }

  /**
   * GraphQL mutation: logout
   *
   * @returns {UserResponseDTO}
   */
  @Mutation()
  async logout(): Promise<boolean> {
    // eslint-disable-next-line no-debugger
    debugger;

    return this.userService.logout();
  }
}
