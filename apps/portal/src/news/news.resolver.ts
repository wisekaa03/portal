/** @format */

// #region Imports NPM
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { IsAdminGuard } from '../guards/admin.guard';
import { NewsService } from './news.service';
import { UserResponse } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { NewsEntity } from './news.entity';
import { News } from './models/news.dto';
// #endregion

@Resolver('News')
export class NewsResolver {
  constructor(private readonly newsService: NewsService, private readonly userService: UserService) {}

  /**
   * GraphQL query: news
   *
   * @returns {News[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async news(): Promise<NewsEntity[]> {
    return this.newsService.news();
  }

  /**
   * GraphQL mutation: editNews
   *
   * @returns {string} - id of news
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async editNews(
    @Context('req') req: Request,
    /* eslint-disable prettier/prettier */
      @Args('title') title: string,
      @Args('excerpt') excerpt: string,
      @Args('content') content: string,
      @Args('id') id: string,
      /* eslint-enable prettier/prettier */
  ): Promise<NewsEntity> {
    const userId = req.user as UserResponse;
    if (userId) {
      const user = await this.userService.readById(userId.id, false);
      if (user) {
        return this.newsService.editNews({ title, excerpt, content, user, id });
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteNews
   *
   * @returns {boolean} - true/false of delete news
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @UseGuards(IsAdminGuard)
  async deleteNews(@Args('id') id: string): Promise<boolean> {
    return this.newsService.deleteNews(id);
  }
}
