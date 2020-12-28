/** @format */
/* eslint-disable no-underscore-dangle */

//#region Imports NPM
import type { Request } from 'express';
import { UseGuards, Inject, UnauthorizedException, NotAcceptableException, NotImplementedException } from '@nestjs/common';
import { ResolveField, Query, Resolver, Mutation, Subscription, Args, Context } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { DocFlowTask } from '@lib/types/docflow';
import { User } from '@back/user/user.entity';
import type { SubscriptionPayload, WebsocketContext } from '@back/shared/types';
import { PortalPubSub } from '@back/shared/constants';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { DocFlowTaskGraphql, DocFlowTaskInput, DocFlowTasksInput, DocFlowBusinessProcessTask } from './graphql';
import { DocFlowService } from './docflow.service';
import { DocFlowTasks } from './graphql/DocFlowTasks';
//#endregion

@Resolver()
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
  @Query(() => [DocFlowTasks])
  @UseGuards(GqlAuthGuard)
  async docFlowTasks(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('tasks', { type: () => DocFlowTasksInput, nullable: true }) tasks?: DocFlowTasksInput,
  ): Promise<DocFlowTasks[]> {
    return this.docflowService.docFlowTasksCache({
      user,
      password,
      tasks,
      loggerContext: { username: user.username, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => [DocFlowTasks], {
    filter: (payload: SubscriptionPayload<DocFlowTasks[]>, variables: { tasks?: DocFlowTasksInput }, context: WebsocketContext) =>
      payload.userId === context?.user?.id,
    resolve: (payload: SubscriptionPayload<DocFlowTasks[]>) => payload.object,
  })
  async docFlowTasksSubscription(): Promise<AsyncIterator<DocFlowTasks[]>> {
    return this.pubSub.asyncIterator<DocFlowTasks[]>(PortalPubSub.DOCFLOW_TASKS);
  }

  // /**
  //  * docflow Task
  //  *
  //  * @async
  //  * @returns {DocFlowTask}
  //  * @throws {UnauthorizedException | HttpException}
  //  */
  // @Query('docFlowTask')
  // @UseGuards(GqlAuthGuard)
  // async docFlowTask(
  //   @Context('req') request: Request,
  //   @Args('task') task: DocFlowTaskInput,
  //   @CurrentUser() user?: User,
  //   @PasswordFrontend() password?: string,
  // ): Promise<DocFlowTask> {
  //   if (!user || !password) {
  //     throw new UnauthorizedException();
  //   }

  //   return this.docflowService.docFlowTaskCache({
  //     user,
  //     password,
  //     task,
  //     loggerContext: { username: user.username, headers: request.headers },
  //   });
  // }

  // @UseGuards(GqlAuthGuard)
  // @Subscription('docFlowTask', {
  //   filter: (payload: SubscriptionPayload<DocFlowTask>, variables: { task: DocFlowTaskInput }, context: WebsocketContext) =>
  //     payload.object.id === variables.task.id,
  //   resolve: (payload: SubscriptionPayload<DocFlowTask>) => payload.object,
  // })
  // async docFlowTaskSubscription(): Promise<AsyncIterator<DocFlowTask>> {
  //   return this.pubSub.asyncIterator<DocFlowTask>(PortalPubSub.DOCFLOW_TASK);
  // }

  // /**
  //  * docflow Target
  //  *
  //  * @async
  //  * @returns {DocFlowTarget}
  //  * @throws {UnauthorizedException | HttpException}
  //  */
  // @Query('docFlowInternalDocument')
  // @UseGuards(GqlAuthGuard)
  // async docFlowInternalDocument(
  //   @Context('req') request: Request,
  //   @Args('internalDocument') internalDocument: DocFlowInternalDocumentInput,
  //   @CurrentUser() user?: User,
  //   @PasswordFrontend() password?: string,
  // ): Promise<DocFlowInternalDocument> {
  //   if (!user || !password) {
  //     throw new UnauthorizedException();
  //   }

  //   return this.docflowService.docFlowInternalDocumentCache({
  //     user,
  //     password,
  //     internalDocument,
  //     loggerContext: { username: user.username, headers: request.headers },
  //   });
  // }

  // @UseGuards(GqlAuthGuard)
  // @Subscription('docFlowInternalDocument', {
  //   filter: (
  //     payload: SubscriptionPayload<DocFlowInternalDocument>,
  //     variables: { internalDocument: DocFlowInternalDocumentInput },
  //     context: WebsocketContext,
  //   ) => payload.object.id === variables.internalDocument.id,
  //   resolve: (payload: SubscriptionPayload<DocFlowInternalDocument>) => payload.object,
  // })
  // async docFlowInternalDocumentSubscription(): Promise<AsyncIterator<DocFlowInternalDocument>> {
  //   return this.pubSub.asyncIterator<DocFlowInternalDocument>(PortalPubSub.DOCFLOW_INTERNAL_DOCUMENT);
  // }

  // /**
  //  * DocFlow file
  //  *
  //  * @async
  //  * @returns {DocFlowFileVersion}
  //  * @throws {UnauthorizedException | HttpException}
  //  */
  // @Query('docFlowFile')
  // @UseGuards(GqlAuthGuard)
  // async docFlowFile(
  //   @Context('req') request: Request,
  //   @Args('file') file: DocFlowFileInput,
  //   @CurrentUser() user?: User,
  //   @PasswordFrontend() password?: string,
  // ): Promise<DocFlowFile> {
  //   if (!user || !password) {
  //     throw new UnauthorizedException();
  //   }

  //   return this.docflowService.docFlowFile({ user, password, file
  // loggerContext: { username: user.username, headers: request.headers } });
  // }

  // /**
  //  * DocFlow process step
  //  *
  //  * @async
  //  * @returns {DocFlowTask}
  //  * @throws {UnauthorizedException | HttpException}
  //  */
  // @Mutation('docFlowProcessStep')
  // @UseGuards(GqlAuthGuard)
  // async docFlowChangeProcessStep(
  //   @Context('req') request: Request,
  //   @Args('taskID') taskID: string,
  //   @Args('data') data: DocFlowData,
  //   @CurrentUser() user?: User,
  //   @PasswordFrontend() password?: string,
  // ): Promise<DocFlowTask> {
  //   if (!user || !password) {
  //     throw new UnauthorizedException();
  //   }
  //   if (!data.processStep) {
  //     throw new NotAcceptableException();
  //   }

  //   return this.docflowService.docFlowProcessStep({
  //     taskID,
  //     data,
  //     user,
  //     password,
  //     loggerContext: { username: user.username, headers: request.headers },
  //   });
  // }
}
