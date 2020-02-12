/** @format */

// #region Imports NPM
import { Query, Mutation, Resolver, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { paginate, Order, Connection } from 'typeorm-graphql-pagination';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { IsAdminGuard } from '../guards/admin.guard';
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
import { Profile } from './models/profile.dto';
// #endregion

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GraphQL query: profiles
   *
   * @param first
   * @param after
   * @param orderBy
   * @param search
   * @param disabled
   * @returns {Profiles[]}
   */
  /* eslint @typescript-eslint/indent:0 */
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
   * @param search
   * @returns {string[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async searchSuggestions(@Args('search') search: string): Promise<ProfileEntity[]> {
    return this.profileService.searchSuggestions(search);
  }

  /**
   * GraphQL query: profile
   *
   * @param id
   * @returns {Profiles[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profile(@Args('id') id: string): Promise<ProfileEntity | undefined> {
    return this.profileService.profile(id) || null;
  }

  /**
   * GraphQL mutation: changeProfile
   *
   * @param req
   * @param profile
   * @returns {Boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async changeProfile(@Context('req') req: Request, @Args('profile') profile: Profile): Promise<ProfileEntity> {
    return this.profileService.changeProfile(req, profile);
  }
}
