/** @format */

// #region Imports NPM
import { Resolver, Query, Mutation, Context, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { FilesFolderResponse } from '@lib/types';
import { LogService } from '@app/logger';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserResponse } from '@back/user/user.entity';
import { UserService } from '@back/user/user.service';
import { FilesEntity } from './files.entity';
import { FilesService } from './files.service';
// #endregion

@Resolver('Files')
export class FilesResolver {
  constructor(
    private readonly logService: LogService,
    private readonly filesService: FilesService,
    private readonly userService: UserService,
  ) {}

  /**
   * GraphQL query: files get
   *
   * @param {string} - id of files, optional
   * @returns {FilesEntity[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async file(@Args('id') id?: string): Promise<FilesEntity[]> {
    return this.filesService.file(id);
  }

  /**
   * GraphQL mutation: editFile
   *
   * @param {Request} - Express request
   * @param {Promise<FileUpload>} - Attachment
   * @param {string} - id of folder
   * @param {string} - id of files, optional
   * @returns {FilesEntity} - files entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editFile(
    @Context('req') req: Request,
    @Args('attachment') attachment: Promise<FileUpload>,
    @Args('folder') folder: string,
    @Args('id') id?: string,
  ): Promise<FilesEntity> {
    const updatedUser = await this.userService.byId((req.user as UserResponse).id, true, false);

    if (updatedUser) {
      // eslint-disable-next-line no-debugger
      debugger;
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteFile
   *
   * @param {string} - id of files
   * @returns {boolean} - true/false of delete files
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteFile(@Args('id') id: string): Promise<boolean> {
    return !!id && this.filesService.deleteFile(id);
  }

  /**
   * GraphQL query: folder
   *
   * @param {string} id of folder (optional)
   * @returns {Promise<FilesFolderResponse[]>} Folder entity
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async folder(@Context('req') req: Request, @Args('id') id?: string): Promise<FilesFolderResponse[]> {
    if (req.user) {
      return this.filesService.folder(req.user as UserResponse, id);
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: editFolder
   *
   * @param {Request} req Express request
   * @param {string} pathname Pathname
   * @param {boolean} shared this is a shared folder or not ?
   * @param {string} id of folder (optional)
   * @returns {Promise<FilesFolderResponse>} Files folder entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editFolder(
    @Context('req') req: Request,
    @Args('pathname') pathname: string,
    @Args('shared') shared: boolean,
    @Args('id') id?: string,
  ): Promise<FilesFolderResponse> {
    if (req.user) {
      const user = req.user as UserResponse;
      return this.filesService.editFolder({ pathname, user: shared ? undefined : user, id, updatedUser: user });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteFolder
   *
   * @param {string} id of folder
   * @returns {boolean} true/false of delete folder
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteFolder(@Args('id') id: string): Promise<string | undefined> {
    return id ? this.filesService.deleteFolder(id) : undefined;
  }
}
