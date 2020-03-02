/** @format */

// #region Imports NPM
import { Resolver, Query, Mutation, Context, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { MediaFolderEntity } from './media.folder.entity';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { UserResponse } from '../user/user.entity';
import { UserService } from '../user/user.service';
// #endregion

@Resolver('Media')
export class MediaResolver {
  constructor(
    private readonly logService: LogService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
  ) {}

  /**
   * GraphQL query: media get
   *
   * @param {string} - id of media, optional
   * @returns {MediaEntity[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async file(@Args('id') id?: string): Promise<MediaEntity[]> {
    return this.mediaService.file(id);
  }

  /**
   * GraphQL mutation: editMedia
   *
   * @param {Request} - Express request
   * @param {Promise<FileUpload>} - Attachment
   * @param {string} - id of folder
   * @param {string} - id of media, optional
   * @returns {MediaEntity} - media entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editFile(
    @Context('req') req: Request,
    @Args('attachment') attachment: Promise<FileUpload>,
    @Args('folder') folder: string,
    @Args('id') id?: string,
  ): Promise<MediaEntity> {
    const updatedUser = await this.userService.readById((req.user as UserResponse).id, true, false);

    if (updatedUser) {
      // eslint-disable-next-line no-debugger
      debugger;
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteMedia
   *
   * @param {string} - id of media
   * @returns {boolean} - true/false of delete media
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteFile(@Args('id') id: string): Promise<boolean> {
    return !!id && this.mediaService.deleteFile(id);
  }

  /**
   * GraphQL query: folder
   *
   * @param {string} - id of folder, optional
   * @returns {MediaFolderEntity[]} - Folder entity
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async folder(@Args('id') id?: string): Promise<MediaFolderEntity[]> {
    return this.mediaService.folder(id);
  }

  /**
   * GraphQL mutation: editFolder
   *
   * @param {Request} - Express request
   * @param {string} - Pathname (without /)
   * @param {string} - "shared" or "user ID"
   * @param {string} - ID of folder
   * @returns {MediaFolderEntity} - Media folder entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editFolder(
    @Context('req') req: Request,
    @Args('pathname') pathname: string,
    @Args('userId') userId?: string,
    @Args('id') id?: string,
  ): Promise<MediaFolderEntity> {
    const updatedUser = await this.userService.readById((req.user as UserResponse).id, true, false);

    if (updatedUser) {
      const user = userId ? await this.userService.readById(userId, true, false) : undefined;

      return this.mediaService.editFolder({ pathname, user, id, updatedUser });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteFolder
   *
   * @param {string} - id of folder
   * @returns {boolean} - true/false of delete folder
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteFolder(@Args('id') id: string): Promise<boolean> {
    return !!id && this.mediaService.deleteFolder(id);
  }
}
