/** @format */

// #region Imports NPM
import { Query, Resolver, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { ProfileService } from './profile.service';
import { ProfileEntity } from './profile.entity';
// #endregion

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GraphQL query: profiles
   *
   * @param take
   * @param skip
   * @returns {Profiles[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Args('take') take: number,
    @Args('skip') skip: number,
    @Args('orderBy') orderBy: string,
    @Args('order') order: string,
  ): Promise<ProfileEntity[]> {
    return this.profileService.profiles(take, skip, orderBy, order);
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
   * GraphQL query: profilesSearch
   *
   * @param search
   * @returns {Profiles[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profilesSearch(
    @Args('search') search: string,
    @Args('orderBy') orderBy: string,
    @Args('order') order: string,
  ): Promise<ProfileEntity[] | undefined> {
    return this.profileService.profilesSearch(search, orderBy, order) || null;
  }
}
