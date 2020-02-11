/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { MediaEntity } from './media.entity';
import { Media } from './models/media.dto';
import { MediaDirectoryEntity } from './media.directory.entity';
// #endregion

@Injectable()
export class MediaService {
  constructor(
    private readonly logService: LogService,
    // private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    @InjectRepository(MediaDirectoryEntity)
    private readonly mediaDirectoryRepository: Repository<MediaDirectoryEntity>,
  ) {}

  /**
   * Fetch news
   *
   * @return News
   */
  media = async (id: string): Promise<MediaEntity[]> => {
    this.logService.log(`Media entity: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaRepository.find({ id });
  };

  /**
   * Edit media
   *
   * @return id
   */
  editMedia = async ({ title, directory, filename, mimetype, updatedUser, id }: Media): Promise<MediaEntity> => {
    this.logService.log(
      `Edit: ${JSON.stringify({ title, directory, filename, mimetype, updatedUser, id })}`,
      'MediaService',
    );

    const directoryEntity = await this.mediaDirectoryRepository.findOne(directory as string);

    const data = {
      title,
      directory: directoryEntity,
      filename,
      mimetype,
      updatedUser,
      id,
    };

    return this.mediaRepository.save(this.mediaRepository.create(data)).catch((error) => {
      throw error;
    });
  };

  /**
   * Delete news
   *
   * @return void
   */
  deleteMedia = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };

  /**
   * Directory
   *
   * @return MediaDirectoryEntity
   */
  directory = async (id: string): Promise<MediaDirectoryEntity[]> => {
    this.logService.log(`Directory: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaDirectoryRepository.find({ id });
  };

  /**
   * Delete news
   *
   * @return void
   */
  deleteDirectory = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit directory: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaDirectoryRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
