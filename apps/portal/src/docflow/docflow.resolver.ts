/** @format */

//#region Imports NPM
import { UseGuards, Inject, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import type { DocFlowTask, DocFlowTasksInput, DocFlowTaskInput, DocFlowFile, DocFlowFileInput } from '@lib/types/docflow';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import type { DocFlowTasksPayload } from './docflow.utils';
import { DocFlowService } from './docflow.service';
//#endregion

// TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.

@Resolver('DocFlowResolver')
export class DocFlowResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly docflowService: DocFlowService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  /**
   * DocFlowTasks list
   *
   * @async
   * @returns {DocFlowTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowGetTasks')
  @UseGuards(GqlAuthGuard)
  async docFlowGetTasks(
    @Args('tasks') tasks?: DocFlowTasksInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowTask[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowGetTasksCache(user, password, tasks).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowGetTasks', {
    filter: (payload: DocFlowTasksPayload, variables, context) => payload.userId === context?.user?.id,
    resolve: (payload: DocFlowTasksPayload) => payload.ticketsTasks,
  })
  async docFlowGetTasksSubscription(): Promise<AsyncIterator<DocFlowTask[]>> {
    return this.pubSub.asyncIterator<DocFlowTask[]>('docFlowGetTasks');
  }

  /**
   * DocFlowTask
   *
   * @async
   * @returns {DocFlowTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowGetTask')
  @UseGuards(GqlAuthGuard)
  async docFlowGetTask(
    @Args('task') task?: DocFlowTaskInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowGetTaskCache(user, password, task).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowGetTask', {
    filter: (payload, variables, context) => payload?.userId === context?.user?.id,
  })
  async docFlowGetTaskSubscription(): Promise<AsyncIterator<DocFlowTask>> {
    return this.pubSub.asyncIterator<DocFlowTask>('docFlowGetTask');
  }

  /**
   * DocFlowTask
   *
   * @async
   * @returns {DocFlowFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowGetFile')
  @UseGuards(GqlAuthGuard)
  async docFlowGetFile(
    @Args('file') file?: DocFlowFileInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowGetFileCache(user, password, file).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowGetFile', {
    filter: (payload, variables, context) => payload?.userId === context?.user?.id,
  })
  async docFlowGetFileSubscription(): Promise<AsyncIterator<DocFlowFile>> {
    return this.pubSub.asyncIterator<DocFlowFile>('docFlowFile');
  }
}
