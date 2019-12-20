/** @format */

// #region Imports NPM
import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { UserService } from './user.service';
import { User } from './models/user.dto';
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
   * GraphQL query: soap 1c synchronization
   *
   * @param req
   * @returns {Boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async soap1csynch(@Context('req') req: Request): Promise<boolean | null> {
    return this.userService.soap1csynch(req) || null;
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
  async userSettings(@Context('req') req: Request, @Args('value') value: any): Promise<User | boolean> {
    return this.userService.settings(req, value) || null;
  }
}
