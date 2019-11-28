/** @format */

// #region Imports NPM
import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { NewsService } from './news.service';
import { News } from './news.interface';
// #endregion

@Resolver('News')
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  /**
   * GraphQL query: news
   *
   * @returns {any}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async news(): Promise<News[]> {
    return this.newsService.news().then((entries) => {
      return entries.data;
    });
  }
}
