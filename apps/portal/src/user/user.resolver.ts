/** @format */

//#region Imports NPM
import type { Request } from 'express';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
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
  async syncLdap(@Context('req') request: Request, @CurrentUser() user?: User): Promise<boolean> {
    return this.userService.syncLdap({ loggerContext: { username: user?.username, headers: request.headers } });
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
    @Args('domain') domain: string,
    @Args('photo') thumbnailPhoto?: Promise<FileUpload>,
    @CurrentUser() user?: User,
  ): Promise<Profile> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.ldapNewUser({
      request,
      value,
      domain,
      thumbnailPhoto,
      loggerContext: { username: user.username, headers: request.headers },
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
  async ldapCheckUsername(
    @Context('req') request: Request,
    @Args('value') value: string,
    @Args('domain') domain: string,
    @CurrentUser() user?: User,
  ): Promise<boolean> {
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.ldapCheckUsername({ value, domain, loggerContext: { username: user.username, headers: request.headers } });
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
  async userSettings(@Context('req') request: Request, @Args('value') value: UserSettings, @CurrentUser() user?: User): Promise<User> {
    if (!user) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line no-param-reassign
    user.settings = this.userService.settings(value, user);

    return this.userService.save({
      user: this.userService.create(user),
      loggerContext: { username: user.username, headers: request.headers },
    });
  }
}
