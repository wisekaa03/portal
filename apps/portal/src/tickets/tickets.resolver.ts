/** @format */

// #region Imports NPM
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapAuthentication } from '@app/soap';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { User } from '@lib/types/user.dto';
import { TicketsService } from './tickets.service';
import { TkRoutes, TkTasks, TkTaskNew, TkTaskNewInput, TkTaskEditInput, TkTask } from '../../lib/types/tickets';
// #endregion

@Resolver('TicketsResolver')
export class TicketsResolver {
  constructor(private readonly configService: ConfigService, private readonly ticketsService: TicketsService) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @returns {TkRoutes[]}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsRoutes')
  @UseGuards(GqlAuthGuard)
  async TicketsRoutes(@CurrentUser() user?: User, @PasswordFrontend() password?: string): Promise<TkRoutes[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsRoutes(user, password).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Tasks list
   *
   * @async
   * @param {string} status Status
   * @returns {TkTasks[]}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsTasks')
  @UseGuards(GqlAuthGuard)
  async TicketsTasks(
    @Args('status') status: string,
    @Args('find') find: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTasks[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    const promise = await this.ticketsService.TicketsTasks(user, password, status, find).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });

    return promise;
  }

  /**
   * New task
   *
   * @async
   * @method TicketsTaskNew
   * @param {TkTaskNewInput} ticket subject, body, serviceID and others
   * @param {Promise<FileUpload>[]} attachments Array of attachments
   * @returns {TkTaskNew}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation('TicketsTaskNew')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskNew(
    @Args('ticket') ticket: TkTaskNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTaskNew> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskNew(user, password, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Edit task
   *
   * @async
   * @returns {TkTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation('TicketsTaskEdit')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskEdit(
    @Args('ticket') ticket: TkTaskEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskEdit(user, password, ticket, attachments).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Get description of task
   *
   * @async
   * @returns {TkTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsTaskDescription')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskDescription(
    @Args('code') code: string,
    @Args('type') type: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskDescription(user, password, code, type).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
