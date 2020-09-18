/** @format */

//#region Imports NPM
import { UseGuards, Inject, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Subscription, Args } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import type { DocFlowTask, DocFlowTasksInput } from '@lib/types/docflow';
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
    // TODO: сделать чтобы по пользакам отбиралось
    // filter: (payload, variables) => true,
  })
  async docFlowGetTasksSubscription(): Promise<AsyncIterator<DocFlowTask[]>> {
    return this.pubSub.asyncIterator<DocFlowTask[]>('ticketsRoutes');
  }
}
