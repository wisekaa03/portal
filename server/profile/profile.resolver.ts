/** @format */

// #region Imports NPM
import { Query, Resolver, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { paginate, Order, Connection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import { Repository } from 'typeorm';
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
   * @param first
   * @param after
   * @param orderBy
   * @param search
   * @returns {Profiles[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Args('first') first: number,
    @Args('after') after: string,
    @Args('orderBy') orderBy: Order<string>,
    @Args('search') search: string,
  ): Promise<Connection<ProfileEntity>> {
    return paginate(
      { first, after, orderBy },
      {
        type: 'Profile',
        alias: 'profile',
        validateCursor: true,
        orderFieldToKey: (field: string) => field,
        queryBuilder: this.profileService.getProfiles(search),
      },
    );
    // return this.profileService.profiles(take, orderBy, order);
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
}
