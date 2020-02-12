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
import { MediaDirectory } from './models/media.directory.dto';
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
   * Get media
   *
   * @param {string} - id of media, optional
   * @return {MediaEntity[]}
   */
  media = async (id?: string): Promise<MediaEntity[]> => {
    this.logService.log(`Media entity: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaRepository.find(id ? { id } : undefined);
  };

  /**
   * Edit media
   *
   * @param {Media}
   * @return {MediaEntity}
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
   * Delete media
   *
   * @param {string} - id of media
   * @return {boolean} - true/false of delete media
   */
  deleteMedia = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };

  /**
   * Get directory
   *
   * @param {string} - id of directory, optional
   * @return {MediaDirectoryEntity[]}
   */
  folders = async (id?: string): Promise<MediaDirectoryEntity[]> => {
    this.logService.log(`Directory: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaDirectoryRepository.find(id ? { id } : undefined);
  };

  /**
   * Edit directory
   *
   * @param {Directory}
   * @return {MediaDirectoryEntity}
   */
  editFolder = async ({ id, user, pathname, updatedUser }: MediaDirectory): Promise<MediaDirectoryEntity> => {
    this.logService.log(`Edit: ${JSON.stringify({ pathname, id, user, updatedUser })}`, 'MediaService');

    // TODO: сделать чтобы одинаковые имена не появлялись на одном уровне вложенности
    // const folderPathname = await this.mediaDirectoryRepository.findOne({ pathname });

    let data = id
      ? await this.mediaDirectoryRepository.findOne({ id })
      : ({ createdUser: updatedUser } as MediaDirectory);

    data = {
      ...data,
      pathname,
      user,
      updatedUser,
      id,
    };

    return this.mediaDirectoryRepository.save(this.mediaDirectoryRepository.create(data)).catch((error: Error) => {
      throw error;
    });
  };

  /**
   * Delete directory
   *
   * @param {string} - id of directory
   * @return {boolean} - true/false of delete directory
   */
  deleteFolder = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit directory: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaDirectoryRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
