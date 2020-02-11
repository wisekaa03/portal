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
import { MediaDirectoryEntity } from './media.directory.entity';
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
  async media(@Args('id') id: string): Promise<MediaEntity[]> {
    return this.mediaService.media(id);
  }

  /**
   * GraphQL mutation: editMedia
   *
   * @param {Request} - Express request
   * @param {Promise<FileUpload>} - Attachment
   * @param {string} - id of directory
   * @param {string} - id of media, optional
   * @returns {MediaEntity} - media entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editMedia(
    @Context('req') req: Request,
    @Args('attachment') attachment: Promise<FileUpload>,
    @Args('directory') directory: string,
    @Args('id') id: string,
  ): Promise<MediaEntity> {
    const updatedUser = await this.userService.readById((req.user as UserResponse).id);

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
  async deleteMedia(@Args('id') id: string): Promise<boolean> {
    return this.mediaService.deleteMedia(id);
  }

  /**
   * GraphQL query: directory
   *
   * @param {string} - id of directory, optional
   * @returns {MediaDirectoryEntity[]} - Directory entity
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async directory(@Args('id') id: string): Promise<MediaDirectoryEntity[]> {
    return this.mediaService.directory(id);
  }

  /**
   * GraphQL mutation: editDirectory
   *
   * @param {Request} - Express request
   * @param {string} - Pathname (without /)
   * @param {string} - "shared" or "user ID"
   * @param {string} - ID of directory
   * @returns {MediaDirectoryEntity} - Media directory entity
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editDirectory(
    @Context('req') req: Request,
    @Args('pathname') pathname: string,
    @Args('userId') userId?: string,
    @Args('id') id?: string,
  ): Promise<MediaDirectoryEntity> {
    const updatedUser = await this.userService.readById((req.user as UserResponse).id);

    if (updatedUser) {
      const user = userId ? await this.userService.readById(userId) : undefined;

      return this.mediaService.editDirectory({ pathname, user, id, updatedUser });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteDirectory
   *
   * @param {string} - id of directory
   * @returns {boolean} - true/false of delete directory
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteDirectory(@Args('id') id: string): Promise<boolean> {
    return this.mediaService.deleteDirectory(id);
  }
}
