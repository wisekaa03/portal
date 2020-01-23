/** @format */

// #region Imports NPM
import { UseGuards } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../../guards/gqlauth.guard';
import { Route } from './models/old-service.interface';
// #endregion

@Resolver('TicketOldService')
export class TicketOldServiceResolver {
  /**
   * GraphQL query: GetRoutes
   *
   * @returns {Route[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async GetRoutes(): Promise<Route[]> {
    const routes = [{} as Route];

    return routes;
  }
}
