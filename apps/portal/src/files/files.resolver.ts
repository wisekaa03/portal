/** @format */

//#region Imports NPM
import { Resolver, Query, Mutation, Context, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
// import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FileDetails } from 'nextcloud-link/compiled/source/types';
//#endregion
//#region Imports Local
import { User, FilesFile, FilesOptions } from '@lib/types';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from '@back/user/user.service';
import { CurrentUser } from '@back/user/user.decorator';
import { FilesService } from './files.service';
import { PasswordFrontend } from '../user/user.decorator';
//#endregion

@Resolver('Files')
export class FilesResolver {
  constructor(
    @InjectPinoLogger(FilesResolver.name) private readonly logger: PinoLogger,
    private readonly filesService: FilesService,
    private readonly userService: UserService,
  ) {}

  /**
   * GraphQL query: list files in a folder
   *
   * @param {string} path
   * @returns {FileDetails[]}
   */
  @Query('folderFiles')
  @UseGuards(GqlAuthGuard)
  async folderFiles(
    @Args('path') path: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<FileDetails[]> {
    if (!user || !password) {
      throw new UnauthorizedException();
    }

    return this.filesService.folderFiles(path, user, password);
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
  ): Promise<void> {
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
}
