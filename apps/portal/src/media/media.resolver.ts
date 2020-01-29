/** @format */

// #region Imports NPM
import { Resolver, Query, Mutation, Context, Args } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { UserResponse } from '../user/user.entity';
import { UserService } from '../user/user.service';
// #endregion

@Resolver('Media')
export class MediaResolver {
  constructor(private readonly mediaService: MediaService, private readonly userService: UserService) {}

  /**
   * GraphQL query: media get
   *
   * @returns {MediaEntity[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async media(): Promise<MediaEntity[]> {
    return this.mediaService.media();
  }

  /**
   * GraphQL mutation: editMedia
   *
   * @returns {string} - id of media
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async editMedia(
    @Context('req') req: Request,
    /* eslint-disable prettier/prettier */
      @Args('file') file: Promise<FileUpload>,
      @Args('directory') directory: string,
      @Args('id') id: string,
      /* eslint-enable prettier/prettier */
  ): Promise<MediaEntity> {
    const userId = req.user as UserResponse;
    if (userId) {
      const updatedUser = await this.userService.readById(userId.id);
      if (updatedUser) {
        console.log('File', file);
        const { filename, mimetype, createReadStream } = await file;
        const readableStream = createReadStream();
        // const writableStream = new WritableStream<Buffer>();
        // readableStream.pipe(writableStream);

        return this.mediaService.editMedia({
          title: filename,
          directory,
          filename,
          mimetype,
          updatedUser,
          id,
        });
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: deleteMedia
   *
   * @returns {boolean} - true/false of delete media
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async deleteMedia(@Args('id') id: string): Promise<boolean> {
    return this.mediaService.deleteMedia(id);
  }
}
