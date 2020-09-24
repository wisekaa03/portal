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
  TkTaskInput,
  TkFile,
  TkFileInput,
  TkCommentInput,
} from '@lib/types/tickets';
import type { SubscriptionPayload } from '@back/shared/types';
import { PortalPubSub } from '@back/shared/constants';
import { User } from '@lib/types/user.dto';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { TicketsService } from './tickets.service';
//#endregion

@Resolver('TicketsResolver')
export class TicketsResolver {
  constructor(private readonly ticketsService: TicketsService, @Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

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
    filter: (payload: SubscriptionPayload<TkRoutes>, variables: TkRoutesInput, context) => payload.userId === context?.user?.id,
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
    filter: (payload: SubscriptionPayload<TkTasks>, variables: TkTasksInput, context) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload.userId === context?.user?.id;
    },
    resolve: (payload: SubscriptionPayload<TkTasks>) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload.object;
    },
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
  @Query('ticketsTask')
  @UseGuards(GqlAuthGuard)
  async ticketsTask(
    @Args('task') task: TkTaskInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkEditTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsTaskCache(user, password, task).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('ticketsTask', {
    filter: (payload: SubscriptionPayload<TkEditTask>, variables: TkTaskInput, _context) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload.object.task?.where === variables.where && payload.object.task?.code === variables.code;
    },
    resolve: (payload: SubscriptionPayload<TkEditTask>) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload.object;
    },
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
  @Mutation('ticketsComment')
  @UseGuards(GqlAuthGuard)
  async ticketsComment(
    @Args('comment') comment: TkCommentInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.ticketsComment(user, password, comment).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
