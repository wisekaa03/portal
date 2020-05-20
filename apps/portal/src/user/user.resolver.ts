/** @format */

//#region Imports NPM
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
//#endregion
//#region Imports Local
import { User, UserSettings } from '@lib/types/user.dto';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
//#endregion

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Synchronization from LDAP
   * TODO: show that synchronization is in progress
   *
   * @async
   * @returns {boolean}
   */
  @Mutation('syncLdap')
  @UseGuards(GqlAuthGuard)
  async syncLdap(): Promise<boolean> {
    return this.userService.syncLdap();
  }

  /**
   * User settings
   *
   * @async
   * @param {UserSettings} value User settings
   * @returns {UserSettings} Accomplished settings
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userSettings(@CurrentUser() user: User, @Args('value') value: UserSettings | any): Promise<User> {
    // eslint-disable-next-line no-param-reassign
    user.settings = this.userService.settings(user, value);

    return this.userService.save(this.userService.create(user));
  }
}
