/** @format */

// #region Imports NPM
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { User } from '../../user/models/user.dto';
import { GqlAuthGuard } from '../../guards/gqlauth.guard';
import { Route } from './models/old-service.interface';
import { TicketOldService } from './old-service.service';
// #endregion

@Resolver('TicketOldServiceResolver')
export class TicketOldServiceResolver {
  constructor(private readonly ticketOldService: TicketOldService) {}

  /**
   * GraphQL query: GetRoutes
   *
   * @returns {Route[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async GetRoutes(@Context('req') req: Request): Promise<Route[]> {
    const user = req.user as User;

    if (user) {
      return this.ticketOldService.GetRoutes(user.username, user.passwordFrontend as string).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }
}
