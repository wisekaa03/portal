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
   * @param take
   * @param skip
   * @returns {Profiles[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(
    @Args('first') first: number,
    @Args('after') after: string,
    @Args('orderBy') orderBy: Order<string>,
  ): Promise<Connection<ProfileEntity>> {
    return paginate(
      { first, after, orderBy },
      {
        type: 'Profile',
        alias: 'profile',
        validateCursor: true,
        orderFieldToKey: (field: string) => field,
        repository: this.profileService.repository(),
        // TODO: разобраться как прикрутить запросы
        // queryBuilder: await this.profileService.profiles(),
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
