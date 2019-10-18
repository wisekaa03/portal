/** @format */

// #region Imports NPM
import { Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { ProfileService } from './profile.service';
import { Profile } from './models/profile.dto';
// #endregion

@Resolver('Profile')
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GraphQL query: me
   *
   * @param req - request.User
   * @returns {UserResponseDTO}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async profiles(@Context('req') req: Request): Promise<Profile[] | null> {
    // eslint-disable-next-line no-debugger
    debugger;

    return this.profileService.profiles(req) || null;
  }
}
