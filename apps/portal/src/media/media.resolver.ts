/** @format */

// #region Imports NPM
import { Resolver, Query, Mutation, Context, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { concat } from 'apollo-link';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { IsAdminGuard } from '../guards/admin.guard';
import { UserResponse } from '../user/user.entity';
import { UserService } from '../user/user.service';
// #endregion

@Resolver('Media')
export class MediaResolver {
  constructor(private readonly mediaService: MediaService, private readonly userService: UserService) {}

  /**
   * GraphQL query: media get
   *
   * @returns {MediaEntity[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async mediaGet(): Promise<MediaEntity[]> {
    return this.mediaService.mediaGet();
  }

  /**
   * GraphQL mutation: editMedia
   *
   * @returns {string} - id of media
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editMedia(
    @Context('req') req: Request,
    /* eslint-disable prettier/prettier */
      @Args('title') title: string,
      @Args('content') content: Buffer,
      @Args('id') id: string,
      /* eslint-enable prettier/prettier */
  ): Promise<MediaEntity> {
    const userId = req.user as UserResponse;
    if (userId) {
      const user = await this.userService.readById(userId.id);
      if (user) {
        const file = '';

        return this.mediaService.editMedia({ title, file, user, id });
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteMedia
   *
   * @returns {boolean} - true/false of delete media
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteMedia(@Args('id') id: string): Promise<boolean> {
    return this.mediaService.deleteMedia(id);
  }
}
