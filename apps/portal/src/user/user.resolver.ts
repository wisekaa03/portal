/** @format */

//#region Imports NPM
import type { Request } from 'express';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import defaultsDeep from 'lodash/defaultsDeep';
//#endregion
//#region Imports Local
import { PROFILE_TYPE } from '@lib/types/profile';
import { Profile } from '@back/profile/profile.entity';
import { ProfileInput } from '@back/profile/graphql/ProfileInput.input';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { defaultUserSettings } from '@back/shared/constants';
import { UserSettings } from './graphql/UserSettings';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { UserSettingsInput } from './graphql';
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
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async syncLdap(@Context('req') request: Request, @CurrentUser() user: User): Promise<boolean> {
    return this.userService.syncLdap({ loggerContext: { username: user.username, headers: request.headers } });
  }

  /**
   * LDAP: new user
   *
   * @async
   * @param {ProfileInput} ldap The user profile
   * @param {FileUpload} photo Avatar
   * @returns {Profile}
   */
  @Mutation(() => Profile)
  @UseGuards(GqlAuthGuard)
  async ldapNewUser(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('ldap', { type: () => ProfileInput }) ldap: ProfileInput,
    @Args('domain', { type: () => String }) domain: string,
    @Args('photo', { type: () => GraphQLUpload, nullable: true }) thumbnailPhoto?: Promise<FileUpload>,
  ): Promise<PROFILE_TYPE> {
    return this.userService.ldapNewUser({
      request,
      ldap,
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
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async ldapCheckUsername(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('username', { type: () => String }) username: string,
    @Args('domain', { type: () => String }) domain: string,
  ): Promise<boolean> {
    return this.userService.ldapCheckUsername({ username, domain, loggerContext: { username: user.username, headers: request.headers } });
  }

  /**
   * User settings
   *
   * @async
   * @param {UserSettings} value User settings
   * @returns {User} User
   */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async userSettings(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @Args('value', { type: () => UserSettingsInput }) value: UserSettingsInput,
  ): Promise<User> {
    const settings = defaultsDeep(value, user.settings, defaultUserSettings);

    // eslint-disable-next-line no-param-reassign
    user.settings = settings as UserSettings;

    return this.userService.save({
      user: this.userService.create(user),
      loggerContext: { username: user.username, context: UserResolver.name, function: this.userSettings.name, headers: request.headers },
    });
  }
}
