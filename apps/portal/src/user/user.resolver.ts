/** @format */

//#region Imports NPM
import { Request } from 'express';
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
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
  async syncLdap(@CurrentUser() user?: User): Promise<boolean> {
    return this.userService.syncLdap({ loggerContext: { username: user?.username } });
  }

  /**
   * LDAP: new user
   *
   * @async
   * @param {ProfileInput} ldap The user profile
   * @param {FileUpload} photo Avatar
   * @returns {Profile}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async ldapNewUser(
    @Context('req') request: Request,
    @Args('ldap') value: ProfileInput,
    @Args('photo') thumbnailPhoto?: Promise<FileUpload>,
    @CurrentUser() user?: User,
  ): Promise<Profile> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService
      .ldapNewUser({ request, value, thumbnailPhoto, loggerContext: { username: user.username } })
      .catch((error: Error) => {
        throw new HttpException(error.message, 500);
      });
  }

  /**
   * LDAP: check ldap user
   *
   * @async
   * @param {string} value The username to check
   * @returns {boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async ldapCheckUsername(@Args('value') value: string, @CurrentUser() user?: User): Promise<boolean> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.ldapCheckUsername({ value, loggerContext: { username: user.username } });
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

    return this.userService.save({ user: this.userService.create(user), loggerContext: { username: user.username } });
  }
}
