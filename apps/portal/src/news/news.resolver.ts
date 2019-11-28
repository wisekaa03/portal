/** @format */

// #region Imports NPM
import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { NewsService } from './news.service';
// import { NewsEntity } from './news.entity';
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
  async news(): Promise<AxiosResponse<any>> {
    return this.newsService.news();
  }
}
