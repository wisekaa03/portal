/** @format */

//#region Imports NPM
import type { Request, Response } from 'express';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
//#endregion
//#region Imports Local
import { UserService, User, CurrentUser } from '@back/user';
import { IsAdminGuard, GqlAuthGuard } from '@back/guards';
import { NewsService } from './news.service';
import { News } from './news.entity';
//#endregion

@Resolver()
export class NewsResolver {
  constructor(private readonly newsService: NewsService, private readonly userService: UserService) {}

  // /**
  //  * GraphQL query: news
  //  *
  //  * @returns {News[]}
  //  */
  // @Query(() => [News])
  // @UseGuards(GqlAuthGuard)
  // async news(): Promise<News[]> {
  //   return this.newsService.news();
  // }

  // /**
  //  * GraphQL mutation: editNews
  //  *
  //  * @returns {string} - id of news
  //  */
  // @Mutation(() => News)
  // @UseGuards(GqlAuthGuard)
  // @UseGuards(IsAdminGuard)
  // async editNews(
  //   @Context('req') request: Request,
  //   @Args('title', { type: () => String }) title: string,
  //   @Args('excerpt', { type: () => String }) excerpt: string,
  //   @Args('content', { type: () => String }) content: string,
  //   @Args('id', { type: () => String }) id: string,
  //   @CurrentUser() user?: User,
  // ): Promise<News> {
  //   if (!user || !user.id) {
  //     throw new UnauthorizedException();
  //   }

  //   const author = await this.userService.byId({ id: user.id, loggerContext: { username: user.username, headers: request.headers } });
  //   return this.newsService.editNews({ title, excerpt, content, author, id });
  // }

  // /**
  //  * GraphQL mutation: deleteNews
  //  *
  //  * @returns {boolean} - true/false of delete news
  //  */
  // @Mutation(() => Boolean)
  // @UseGuards(GqlAuthGuard)
  // @UseGuards(IsAdminGuard)
  // async deleteNews(@Args('id', { type: () => String }) id: string): Promise<boolean> {
  //   return this.newsService.deleteNews(id);
  // }
}
