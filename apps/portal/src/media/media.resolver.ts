/** @format */

// #region Imports NPM
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
// #endregion

@Resolver('Media')
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

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
}
