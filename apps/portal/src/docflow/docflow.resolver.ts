/** @format */

//#region Imports NPM
import { UseGuards, Inject, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import type {
  DocFlowTask,
  DocFlowTasksInput,
  DocFlowTaskInput,
  DocFlowTargetInput,
  DocFlowTarget,
  DocFlowTargetCollection,
  DocFlowFileList,
  DocFlowFileListInput,
  DocFlowFileVersionInput,
  DocFlowFile,
} from '@lib/types/docflow';
import type { SubscriptionPayload } from '@back/shared/types';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
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
  @Query('docFlowTasks')
  @UseGuards(GqlAuthGuard)
  async docFlowTasks(
    @Args('tasks') tasks?: DocFlowTasksInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowTask[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowTasksCache(user, password, tasks).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowTasks', {
    filter: (payload: SubscriptionPayload, variables, context) => payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload) => payload.object,
  })
  async docFlowTasksSubscription(): Promise<AsyncIterator<DocFlowTask[]>> {
    return this.pubSub.asyncIterator<DocFlowTask[]>('docFlowTasks');
  }

  /**
   * docflow Task
   *
   * @async
   * @returns {DocFlowTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowTask')
  @UseGuards(GqlAuthGuard)
  async docFlowTask(
    @Args('task') task?: DocFlowTaskInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowTaskCache(user, password, task).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowTask', {
    filter: (payload: SubscriptionPayload, variables, context) => payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload) => payload.object,
  })
  async docFlowTaskSubscription(): Promise<AsyncIterator<DocFlowTask>> {
    return this.pubSub.asyncIterator<DocFlowTask>('docFlowTask');
  }

  /**
   * docflow Target
   *
   * @async
   * @returns {DocFlowTarget}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowTarget')
  @UseGuards(GqlAuthGuard)
  async docFlowTarget(
    @Args('target') target?: DocFlowTargetInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowTarget[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowTargetCache(user, password, target).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('docFlowTarget', {
    filter: (payload: SubscriptionPayload, variables, context) => payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload) => payload.object,
  })
  async docFlowTargetSubscription(): Promise<AsyncIterator<DocFlowTarget[]>> {
    return this.pubSub.asyncIterator<DocFlowTarget[]>('docFlowTarget');
  }

  /**
   * DocFlow file list
   *
   * @async
   * @returns {DocFlowFileList}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowFileList')
  @UseGuards(GqlAuthGuard)
  async docFlowFileList(
    @Args('files') files: DocFlowFileListInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowFileList[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowFileList(user, password, files).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * DocFlow file
   *
   * @async
   * @returns {DocFlowFileVersion}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('docFlowFileVersion')
  @UseGuards(GqlAuthGuard)
  async docFlowFileVersion(
    @Args('file') file: DocFlowFileVersionInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<DocFlowFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.docFlowFileVersion(user, password, file).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
