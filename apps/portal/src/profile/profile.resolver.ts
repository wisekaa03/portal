/** @format */

// #region Imports NPM
import { Query, Mutation, Resolver, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { paginate, Order, Connection } from 'typeorm-graphql-pagination';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { IsAdminGuard } from '../guards/gqlauth-admin.guard';
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
import { Profile } from './models/profile.dto';
import { GQLError, GQLErrorCode } from '../shared/gqlerror';
// #endregion

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService, private readonly i18n: I18nService) {}

  /**
   * GraphQL query: profiles
   *
   * @param {number} first
   * @param {string} after
   * @param {Order<string>} orderBy
   * @param {string} search
   * @param {boolean} disabled
   * @returns {Promise<Connection<ProfilesEntity>>}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Args('first') first: number,
    @Args('after') after: string,
    @Args('orderBy') orderBy: Order<string>,
    @Args('search') search: string,
    @Args('disabled') disabled: boolean,
    @Args('notShowing') notShowing: boolean,
  ): Promise<Connection<ProfileEntity>> {
    return paginate(
      { first, after, orderBy },
      {
        type: 'Profile',
        alias: 'profile',
        validateCursor: false,
        orderFieldToKey: (field: string) => field,
        queryBuilder: this.profileService.getProfiles(search, disabled, notShowing),
      },
    );
  }

  /**
   * GraphQL query: searchSuggestions
   *
   * @param {string} search - The search suggestions string
   * @returns {Promise<ProfileEntity[]>}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async searchSuggestions(@Args('search') search: string): Promise<ProfileEntity[]> {
    return this.profileService.searchSuggestions(search);
  }

  /**
   * GraphQL query: profile
   *
   * @param {string} id - optional id of param
   * @returns {ProfilesEntity | undefined}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profile(@Args('id') id: string): Promise<ProfileEntity | undefined> {
    return this.profileService.profile(id) || null;
  }

  /**
   * GraphQL mutation: changeProfile
   *
   * @param {Request} req - The request from which I try to compose user
   * @param {Profile} profile - The profile
   * @param {Promise<FileUpload>} thumbnailPhoto - Avatar
   * @returns {Promise<ProfileEntity>}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async changeProfile(
    @Context('req') req: Request,
    @Args('profile') profile: Profile,
    @Args('thumbnailPhoto') thumbnailPhoto: Promise<FileUpload>,
  ): Promise<ProfileEntity> {
    return this.profileService.changeProfile(req, profile, thumbnailPhoto).catch((error: Error) => {
      throw GQLError({ error, i18n: this.i18n, code: error.message as GQLErrorCode });
    });
  }
}
