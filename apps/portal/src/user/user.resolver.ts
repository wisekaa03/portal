/** @format */

// #region Imports NPM
import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from './user.service';
import { UserResponse } from './user.entity';
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
  async synchronization(@Context('req') req: Request): Promise<boolean> {
    return this.userService.synchronization(req);
  }

  /**
   * GraphQL query: settingsDrawer
   * TODO: вставить сюда synchronizationRunning, или куда-нибудь, чтобы показывать что идет синхронизация
   *
   * @param req
   * @param value
   * @returns {Boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userSettings(@Context('req') req: Request, @Args('value') value: any): Promise<UserResponse | boolean> {
    return this.userService.settings(req, value) || null;
  }
}
