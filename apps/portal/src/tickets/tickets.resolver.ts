/** @format */

//#region Imports NPM
import { Inject, UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import type {
  TkRoutes,
  TkRoutesInput,
  TkTasks,
  TkTasksInput,
  TkEditTask,
  TkTaskNew,
  TkTaskNewInput,
  TkTaskEditInput,
  TkTaskDescriptionInput,
  TkFile,
  TkFileInput,
} from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { TicketsService } from './tickets.service';
//#endregion

@Resolver('TicketsResolver')
export class TicketsResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly ticketsService: TicketsService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @returns {TkRoutes}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('ticketsRoutes')
  @UseGuards(GqlAuthGuard)
  async ticketsRoutes(
    @Args('routes') routes?: TkRoutesInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkRoutes> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsRoutesCache(user, password, routes).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('ticketsRoutes', {
    // TODO: сделать чтобы по пользакам отбиралось
    // filter: (payload, variables) => true,
  })
  async ticketsRoutesSubscription(): Promise<AsyncIterator<TkRoutes>> {
    return this.pubSub.asyncIterator<TkRoutes>('ticketsRoutes');
  }

  /**
   * Tasks list
   *
   * @async
   * @param {string} status Status
   * @returns {TkTasks}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('ticketsTasks')
  @UseGuards(GqlAuthGuard)
  async ticketsTasks(
    @Args('tasks') tasks?: TkTasksInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTasks> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTasksCache(user, password, tasks).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('ticketsTasks', {
    // TODO: сделать чтобы по пользакам отбиралось
    // filter: (payload, variables) => true,
  })
  async ticketsTasksSubscription(): Promise<AsyncIterator<TkTasks>> {
    return this.pubSub.asyncIterator<TkTasks>('ticketsTasks');
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
  @Mutation('ticketsTaskNew')
  @UseGuards(GqlAuthGuard)
  async ticketsTaskNew(
    @Args('task') task: TkTaskNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTaskNew> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTaskNew(user, password, task, attachments).catch((error: Error) => {
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
  @Mutation('ticketsTaskEdit')
  @UseGuards(GqlAuthGuard)
  async ticketsTaskEdit(
    @Args('task') task: TkTaskEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkEditTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTaskEdit(user, password, task, attachments).catch((error: Error) => {
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
  @Query('ticketsTaskDescription')
  @UseGuards(GqlAuthGuard)
  async ticketsTaskDescription(
    @Args('task') task: TkTaskDescriptionInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkEditTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTaskDescription(user, password, task).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('ticketsTaskDescription', {
    // TODO: сделать чтобы по пользакам отбиралось
    // filter: (payload, variables) => true,
  })
  async ticketsTaskDescriptionSubscription(): Promise<AsyncIterator<TkEditTask>> {
    return this.pubSub.asyncIterator<TkEditTask>('ticketsTaskDescription');
  }

  /**
   * Get file of task
   *
   * @async
   * @returns {TkFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation('ticketsTaskFile')
  @UseGuards(GqlAuthGuard)
  async ticketsTaskFile(
    @Args('file') file: TkFileInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTaskFile(user, password, file).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Get file of comment
   *
   * @async
   * @returns {TkFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @Mutation('ticketsCommentFile')
  @UseGuards(GqlAuthGuard)
  async ticketsCommentFile(
    @Args('file') file: TkFileInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsCommentFile(user, password, file).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
