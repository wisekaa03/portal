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
import { DocFlowService } from './docflow.service';
//#endregion

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
    filter: (payload, variables, socket) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload?.userId === socket?.user?.id;
    },
    resolve: (payload) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload?.ticketsTasks;
    },
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
    filter: (payload, variables, socket) => payload?.userId === socket?.user?.id,
  })
  async docFlowGetTaskSubscription(): Promise<AsyncIterator<DocFlowTask>> {
    const docflow = await this.pubSub.asyncIterator<DocFlowTask>('docFlowGetTask');

    return docflow;
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
    filter: (payload, variables, socket) => {
      // eslint-disable-next-line no-debugger
      debugger;

      return payload?.userId === socket?.user?.id;
    },
  })
  async docFlowGetFileSubscription(): Promise<AsyncIterator<DocFlowFile>> {
    return this.pubSub.asyncIterator<DocFlowFile>('docFlowFile');
  }
}
