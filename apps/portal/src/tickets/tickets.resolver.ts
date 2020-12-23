/** @format */

//#region Imports NPM
import type { Request, Response } from 'express';
import { Inject, UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Subscription, Args, Context } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import type { SubscriptionPayload, WebsocketContext } from '@back/shared/types';
import { PortalPubSub } from '@back/shared/constants';
import { User, CurrentUser, PasswordFrontend } from '@back/user';
import { GqlAuthGuard } from '@back/guards';
import {
  TkRoutes,
  TkRoutesInput,
  TkTasks,
  TkTasksInput,
  TkEditTask,
  TkTaskNew,
  TkTaskNewInput,
  TkTaskEditInput,
  TkTaskInput,
  TkFile,
  TkFileInput,
} from './graphql';
import { TkCommentInput } from './graphql/TkComment.input';
import { TicketsService } from './tickets.service';
//#endregion

@Resolver()
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService, @Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @returns {TkRoutes}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query(() => TkRoutes)
  @UseGuards(GqlAuthGuard)
  async ticketsRoutes(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('routes', { type: () => TkRoutesInput, nullable: true }) input?: TkRoutesInput,
  ): Promise<TkRoutes> {
    return this.ticketsService.ticketsRoutesCache({
      user,
      password,
      input,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription((returns) => TkRoutes, {
    // filter: (payload: SubscriptionPayload<TkRoutes>, variables: { routes: TkRoutesInput }, context: WebsocketContext) =>
    //   payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload<TkRoutes>) => payload.object,
  })
  async ticketsRoutesSubscription(): Promise<AsyncIterator<TkRoutes>> {
    return this.pubSub.asyncIterator<TkRoutes>(PortalPubSub.TICKETS_ROUTES);
  }

  /**
   * Tasks list
   *
   * @async
   * @param {string} status Status
   * @returns {TkTasks}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query(() => TkTasks)
  @UseGuards(GqlAuthGuard)
  async ticketsTasks(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('tasks', { type: () => TkTasksInput, nullable: true }) tasks?: TkTasksInput,
  ): Promise<TkTasks> {
    return this.ticketsService.ticketsTasksCache({
      user,
      password,
      tasks,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription((returns) => TkTasks, {
    filter: (payload: SubscriptionPayload<TkTasks>, variables: { tasks: TkTasksInput }, context: WebsocketContext) =>
      payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload<TkTasks>) => payload.object,
  })
  async ticketsTasksSubscription(): Promise<AsyncIterator<TkTasks>> {
    return this.pubSub.asyncIterator<TkTasks>(PortalPubSub.TICKETS_TASKS);
  }

  /**
   * New task
   *
   * @async
   * @method TicketsTaskNew
   * @param {TkTaskNewInput} task subject, body, service and others
   * @param {Promise<FileUpload>[]} attachments Array of attachments
   * @returns {TkTaskNew}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation(() => TkTaskNew)
  @UseGuards(GqlAuthGuard)
  async ticketsTaskNew(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('task', { type: () => TkTaskNewInput }) task: TkTaskNewInput,
    @Args('attachments', { type: () => [GraphQLUpload], nullable: true }) attachments: Promise<FileUpload>[],
  ): Promise<TkTaskNew> {
    return this.ticketsService.ticketsTaskNew({
      user,
      password,
      task,
      attachments,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  /**
   * Edit task
   *
   * @async
   * @returns {TkTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation(() => TkEditTask)
  @UseGuards(GqlAuthGuard)
  async ticketsTaskEdit(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('task', { type: () => TkTaskEditInput }) task: TkTaskEditInput,
    @Args('attachments', { type: () => [GraphQLUpload], nullable: true }) attachments: Promise<FileUpload>[],
  ): Promise<TkEditTask> {
    return this.ticketsService.ticketsTaskEdit({
      user,
      password,
      task,
      attachments,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  /**
   * Get description of task
   *
   * @async
   * @returns {TkTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query((returns) => TkEditTask)
  @UseGuards(GqlAuthGuard)
  async ticketsTask(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('task', { type: () => TkTaskInput }) task: TkTaskInput,
  ): Promise<TkEditTask> {
    return this.ticketsService.ticketsTaskCache({
      user,
      password,
      task,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription((returns) => TkEditTask, {
    filter: (payload: SubscriptionPayload<TkEditTask>, variables: { task: TkTaskInput }, _context: WebsocketContext) =>
      payload.object.task?.where === variables.task.where && payload.object.task?.code === variables.task.code,
    resolve: (payload: SubscriptionPayload<TkEditTask>) => payload.object,
  })
  async ticketsTaskSubscription(): Promise<AsyncIterator<TkEditTask>> {
    return this.pubSub.asyncIterator<TkEditTask>(PortalPubSub.TICKETS_TASK);
  }

  /**
   * Get file of task
   *
   * @async
   * @returns {TkFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => TkFile)
  async ticketsTaskFile(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('file', { type: () => TkFileInput }) file: TkFileInput,
  ): Promise<TkFile> {
    return this.ticketsService.ticketsTaskFile({
      user,
      password,
      file,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }

  /**
   * Get file of comment
   *
   * @async
   * @returns {TkFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => TkFile)
  async ticketsComment(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('comment', { type: () => TkCommentInput }) comment: TkCommentInput,
  ): Promise<TkFile> {
    return this.ticketsService.ticketsComment({
      user,
      password,
      comment,
      loggerContext: { username: user.username, domain: user.loginDomain, headers: request.headers },
    });
  }
}
