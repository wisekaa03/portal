/** @format */

// #region Imports NPM
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { IsAdminGuard } from '../guards/admin.guard';
import { NewsService } from './news.service';
import { News } from './news.interface';
// #endregion

@Resolver('News')
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  /**
   * GraphQL query: news
   *
   * @returns {News[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async news(): Promise<News[]> {
    return this.newsService.news();
  }

  /**
   * GraphQL mutation: editNews
   *
   * @returns {string}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async editNews(
  /* eslint-disable prettier/prettier */
    @Args('title') title: string,
      @Args('excerpt') excerpt: string,
      @Args('content') content: string,
      @Args('date') date: string,
      @Args('id') id: string,
  /* eslint-enable prettier/prettier */
  ): Promise<string> {
    return this.newsService.editNews({ title, excerpt, content, updatedAt: new Date(date), id });
  }

  /**
   * GraphQL mutation: deleteNews
   *
   * @returns {boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async deleteNews(@Args('id') id: string): Promise<boolean> {
    return this.newsService.deleteNews(id);
  }
}
