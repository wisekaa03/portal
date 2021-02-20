/** @format */

//#region Imports NPM
import { Resolver, Subscription, Query, Mutation, Args } from '@nestjs/graphql';
import { Inject, UseGuards, UnauthorizedException, LoggerService, Logger } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from '@back/user/user.service';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { FilesFile, FilesOptionsInput, FilesFolder, Folder } from './graphql';
import { FilesService } from './files.service';
//#endregion

@Resolver()
export class FilesResolver {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
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
  @Query(() => [FilesFolder])
  @UseGuards(GqlAuthGuard)
  async folderFiles(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('path', { type: () => String, nullable: true }) path?: string,
  ): Promise<FilesFolder[]> {
    return this.filesService.folderFiles(user, password, path);
  }

  /**
   * Put file
   *
   * @param {string} path
   * @param {Promise<FileUpload>} file
   * @returns {void}
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async putFile(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('path', { type: () => String }) path: string,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<boolean> {
    return this.filesService.putFile(path, file, user, password);
  }

  /**
   * Get file
   *
   * @param {string} path
   * @returns {void}
   */
  @Mutation(() => FilesFile)
  @UseGuards(GqlAuthGuard)
  async getFile(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Args('path', { type: () => String }) path: string,
    @Args('options', { type: () => FilesOptionsInput }) options?: FilesOptionsInput,
  ): Promise<FilesFile> {
    return this.filesService.getFile(path, user, password, options);
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => [FilesFolder], {
    filter: (payload, variables) =>
      // @todo: сделать чтобы по пользакам отбиралось
      payload.path === variables.path,
  })
  folderFilesSubscription(): AsyncIterator<FilesFolder[]> {
    return this.pubSub.asyncIterator<FilesFolder[]>('folderFilesSubscription');
  }
}
