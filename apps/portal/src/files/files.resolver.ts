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
import { User, FilesFolderResponse } from '@lib/types';
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
   * GraphQL query: list files in a directory
   *
   * @param {string} path
   * @returns {string[]}
   */
  @Query('files')
  @UseGuards(GqlAuthGuard)
  async files(
    @Args('path') path: string,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<FileDetails[]> {
    if (path && user && password) {
      return this.filesService.files(path, user, password);
    }

    throw new Error('Not authorized');
  }
}
