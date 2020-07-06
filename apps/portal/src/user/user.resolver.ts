/** @format */

//#region Imports NPM
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
//#endregion
//#region Imports Local
import { User, UserSettings, UserProfileLDAP } from '@lib/types/user.dto';
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
   * LDAP: new user
   *
   * @async
   * @param {UserProfileLDAP} ldap The user profile
   * @returns {User}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async ldapNewUser(@Args('ldap') ldap: UserProfileLDAP, @CurrentUser() user?: User): Promise<User> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.ldapNewUser(ldap).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
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
  async userSettings(@Args('value') value: UserSettings, @CurrentUser() user?: User): Promise<User> {
    if (!user) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line no-param-reassign
    user.settings = this.userService.settings(user, value);

    return this.userService.save(this.userService.create(user));
  }
}
