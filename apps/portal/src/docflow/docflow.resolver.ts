/** @format */
/* eslint no-underscore-dangle:0 */

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
import {
  DocFlowTaskGraphql,
  DocFlowTaskInput,
  DocFlowTasksInput,
  DocFlowBusinessProcessTask,
  DocFlowFileInput,
  DocFlowInternalDocument,
} from './graphql';
import { DocFlowService } from './docflow.service';
import { DocFlowTasks } from './graphql/DocFlowTasks';
import { DocFlowFile } from './graphql/DocFlowFile';
import { DocFlowInternalDocumentInput } from './graphql/DocFlowInternalDocument.input';
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
  async docFlowTasksSubscription(
    @Args('tasks', { type: () => DocFlowTasksInput, nullable: true }) tasks?: DocFlowTasksInput,
  ): Promise<AsyncIterator<DocFlowTasks[]>> {
    return this.pubSub.asyncIterator<DocFlowTasks[]>(PortalPubSub.DOCFLOW_TASKS);
  }

  /**
   * docflow Task
   *
   * @async
   * @returns {DocFlowTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query(() => DocFlowTaskGraphql)
  @UseGuards(GqlAuthGuard)
  async docFlowTask(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('task') task: DocFlowTaskInput,
  ): Promise<typeof DocFlowTaskGraphql> {
    return this.docflowService.docFlowTaskCache({
      user,
      password,
      task,
      loggerContext: { username: user.username, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => DocFlowTaskGraphql, {
    filter: (payload: SubscriptionPayload<typeof DocFlowTaskGraphql>, variables: { task: DocFlowTaskInput }, context: WebsocketContext) =>
      payload.object.id === variables.task.id,
    resolve: (payload: SubscriptionPayload<typeof DocFlowTaskGraphql>) => payload.object,
  })
  async docFlowTaskSubscription(@Args('task') task: DocFlowTaskInput): Promise<AsyncIterator<typeof DocFlowTaskGraphql>> {
    return this.pubSub.asyncIterator<typeof DocFlowTaskGraphql>(PortalPubSub.DOCFLOW_TASK);
  }

  /**
   * docflow Internal Document
   *
   * @async
   * @returns {DocFlowTarget}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query(() => DocFlowInternalDocument)
  @UseGuards(GqlAuthGuard)
  async docFlowInternalDocument(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('internalDocument') internalDocument: DocFlowInternalDocumentInput,
  ): Promise<DocFlowInternalDocument> {
    return this.docflowService.docFlowInternalDocumentCache({
      user,
      password,
      internalDocument,
      loggerContext: { username: user.username, headers: request.headers },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => DocFlowInternalDocument, {
    filter: (
      payload: SubscriptionPayload<DocFlowInternalDocument>,
      variables: { internalDocument: DocFlowInternalDocumentInput },
      context: WebsocketContext,
    ) => payload.object.id === variables.internalDocument.id,
    resolve: (payload: SubscriptionPayload<DocFlowInternalDocument>) => payload.object,
  })
  async docFlowInternalDocumentSubscription(
    @Args('internalDocument') internalDocument: DocFlowInternalDocumentInput,
  ): Promise<AsyncIterator<DocFlowInternalDocument>> {
    return this.pubSub.asyncIterator<DocFlowInternalDocument>(PortalPubSub.DOCFLOW_INTERNAL_DOCUMENT);
  }

  /**
   * DocFlow file
   *
   * @async
   * @returns {DocFlowFileVersion}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query(() => DocFlowFile)
  @UseGuards(GqlAuthGuard)
  async docFlowFile(
    @Context('req') request: Request,
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('file') file: DocFlowFileInput,
  ): Promise<DocFlowFile> {
    return this.docflowService.docFlowFile({ user, password, file, loggerContext: { username: user.username, headers: request.headers } });
  }

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
