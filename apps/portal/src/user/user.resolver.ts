/** @format */

//#region Imports NPM
import { Resolver, Mutation, Args, ResolveField } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { Profile, User, UserSettings, ProfileInput } from '@lib/types';
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
   * @param {ProfileInput} ldap The user profile
   * @param {FileUpload} thumbnailPhoto Avatar
   * @returns {Profile}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async ldapNewUser(
    @Args('ldap') ldap: ProfileInput,
    @Args('thumbnailPhoto') thumbnailPhoto?: Promise<FileUpload>,
    @CurrentUser() user?: User,
  ): Promise<Profile> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.ldapNewUser(ldap, thumbnailPhoto).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * User settings
   *
   * @async
   * @param {UserSettings} value User settings
   * @returns {User} User
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async userSettings(@Args('value') value: UserSettings, @CurrentUser() user?: User): Promise<User> {
    if (!user) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line no-param-reassign
    user.settings = this.userService.settings(value, user);

    return this.userService.save(this.userService.create(user));
  }
}
