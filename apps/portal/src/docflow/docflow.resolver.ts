/** @format */

//#region Imports NPM
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import type { DocFlowTask } from '@lib/types/docflow';
import { DocFlowService } from './docflow.service';
//#endregion

@Resolver('DocFlowResolver')
export class DocFlowResolver {
  constructor(private readonly configService: ConfigService, private readonly docflowService: DocFlowService) {}

  /**
   * DocFlowTasks list
   *
   * @async
   * @returns {DocFlowTask}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('DocFlowGetTasks')
  @UseGuards(GqlAuthGuard)
  async DocFlowGetTasks(@CurrentUser() user?: User, @PasswordFrontend() password?: string): Promise<DocFlowTask[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.docflowService.DocFlowGetTasks(user, password).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
