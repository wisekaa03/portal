/** @format */

//#region Imports NPM
import { Resolver, Subscription, Query, Mutation, Args, registerEnumType } from '@nestjs/graphql';
import { Inject, UseGuards, UnauthorizedException } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { User, FilesFile, FilesOptions, FilesFolder, Folder } from '@lib/types';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from '@back/user/user.service';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { FilesService } from './files.service';

//#endregion

registerEnumType(Folder, {
  name: 'Folder & files',
  description: 'All possible: Folder and Files',
});

@Resolver('Files')
export class FilesResolver {
  constructor(
    @InjectPinoLogger(FilesResolver.name) private readonly logger: PinoLogger,
    private readonly filesService: FilesService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  /**
   * GraphQL query: list files in a folder
   *
   * @param {string} path
   * @returns {FilesFolder[]}
   */
  @Query('folderFiles')
  @UseGuards(GqlAuthGuard)
  async folderFiles(
    @Args('path') path?: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<FilesFolder[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.filesService.folderFiles(user, password, path);
  }

  /**
   * Put file
   *
   * @param {string} path
   * @param {Promise<FileUpload>} file
   * @returns {void}
   */
  @Mutation('putFile')
  @UseGuards(GqlAuthGuard)
  async putFile(
    @Args('path') path: string,
    @Args('file') file: Promise<FileUpload>,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<boolean> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.filesService.putFile(path, file, user, password);
  }

  /**
   * Get file
   *
   * @param {string} path
   * @returns {void}
   */
  @Mutation('getFile')
  @UseGuards(GqlAuthGuard)
  async getFile(
    @Args('path') path: string,
    @Args('options') options?: FilesOptions,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<FilesFile> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.filesService.getFile(path, user, password, options);
  }

  @UseGuards(GqlAuthGuard)
  @Subscription('folderFilesSubscription', {
    filter: (payload, variables) =>
      // TODO: сделать чтобы по пользакам отбиралось
      payload.path === variables.path,
  })
  folderFilesSubscription(): AsyncIterator<FilesFolder[]> {
    return this.pubSub.asyncIterator<FilesFolder[]>('folderFilesSubscription');
  }
}
