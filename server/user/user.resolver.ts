/** @format */

// #region Imports NPM
import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { UserService } from './user.service';
// #endregion

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * GraphQL query: synchronization
   *
   * @param req
   * @returns {Boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async synchronization(@Context('req') req: Request): Promise<boolean | null> {
    return this.userService.synchronization(req) || null;
  }

  /**
   * GraphQL query: settingsDrawer
   *
   * @param req
   * @param value
   * @returns {Boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userSettings(@Context('req') req: Request, @Args('value') value: any): Promise<any> {
    return this.userService.settings(req, value) || null;
  }
}
