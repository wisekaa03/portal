/** @format */

//#region Imports NPM
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import type {
  TkRoutes,
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
  constructor(private readonly configService: ConfigService, private readonly ticketsService: TicketsService) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @returns {TkRoutes}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsRoutes')
  @UseGuards(GqlAuthGuard)
  async TicketsRoutes(@CurrentUser() user?: User, @PasswordFrontend() password?: string): Promise<TkRoutes> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsRoutes(user, password).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Tasks list
   *
   * @async
   * @param {string} status Status
   * @returns {TkTasks}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsTasks')
  @UseGuards(GqlAuthGuard)
  async TicketsTasks(
    @Args('tasks') tasks?: TkTasksInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTasks> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTasks(user, password, tasks).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
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
  @Mutation('TicketsTaskNew')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskNew(
    @Args('task') task: TkTaskNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkTaskNew> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskNew(user, password, task, attachments).catch((error: Error) => {
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
  @Mutation('TicketsTaskEdit')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskEdit(
    @Args('task') task: TkTaskEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkEditTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskEdit(user, password, task, attachments).catch((error: Error) => {
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
  @Query('TicketsTaskDescription')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskDescription(
    @Args('task') task: TkTaskDescriptionInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkEditTask> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskDescription(user, password, task).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }

  /**
   * Get file of task
   *
   * @async
   * @returns {TkFile}
   * @throws {UnauthorizedException | HttpException}
   */
  @Query('TicketsTaskFile')
  @UseGuards(GqlAuthGuard)
  async TicketsTaskFile(
    @Args('file') file: TkFileInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsTaskFile(user, password, file).catch((error: Error) => {
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
  @Query('TicketsCommentFile')
  @UseGuards(GqlAuthGuard)
  async TicketsCommentFile(
    @Args('file') file: TkFileInput,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<TkFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.ticketsService.TicketsCommentFile(user, password, file).catch((error: Error) => {
      throw new HttpException(error.message, 500);
    });
  }
}
