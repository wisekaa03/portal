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
import { MediaFolderEntity } from './media.folder.entity';
import { MediaFolder } from './models/media.folder.dto';
// #endregion

@Injectable()
export class MediaService {
  constructor(
    private readonly logService: LogService,
    // private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    @InjectRepository(MediaFolderEntity)
    private readonly mediaFolderRepository: Repository<MediaFolderEntity>,
  ) {}

  /**
   * Get file(s)
   *
   * @param {string} - id of media, optional
   * @return {MediaEntity[]}
   */
  file = async (id?: string): Promise<MediaEntity[]> => {
    this.logService.log(`Media entity: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaRepository.find(id ? { id } : undefined);
  };

  /**
   * Edit file
   *
   * @param {Media}
   * @return {MediaEntity}
   */
  editFile = async ({ title, folder, filename, mimetype, updatedUser, id }: Media): Promise<MediaEntity> => {
    this.logService.log(
      `Edit: ${JSON.stringify({ title, folder, filename, mimetype, updatedUser, id })}`,
      'MediaService',
    );

    const folderEntity = await this.mediaFolderRepository.findOne(folder as string);

    const data = {
      title,
      folder: folderEntity,
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
  deleteFile = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };

  /**
   * Get folder
   *
   * @param {string} - id of folder, optional
   * @return {MediaFolderEntity[]}
   */
  folder = async (id?: string): Promise<MediaFolderEntity[]> => {
    this.logService.log(`Folder: id={${id}}`, 'MediaService');

    // TODO: сделать чтобы выводилось постранично
    return this.mediaFolderRepository.find(id ? { id } : undefined);
  };

  /**
   * Edit folder
   *
   * @param {Folder}
   * @return {MediaFolderEntity}
   */
  editFolder = async ({ id, user, pathname, updatedUser }: MediaFolder): Promise<MediaFolderEntity> => {
    this.logService.log(`Edit: ${JSON.stringify({ pathname, id, user, updatedUser })}`, 'MediaService');

    // TODO: сделать чтобы одинаковые имена не появлялись на одном уровне вложенности
    // const folderPathname = await this.mediaFolderRepository.findOne({ pathname });

    let data = id ? await this.mediaFolderRepository.findOne({ id }) : ({ createdUser: updatedUser } as MediaFolder);

    data = {
      ...data,
      pathname,
      user,
      updatedUser,
      id,
    };

    return this.mediaFolderRepository.save(this.mediaFolderRepository.create(data)).catch((error: Error) => {
      throw error;
    });
  };

  /**
   * Delete folder
   *
   * @param {string} - id of folder
   * @return {boolean} - true/false of delete folder
   */
  deleteFolder = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit folder: id={${id}}`, 'MediaService');

    const deleteResult = await this.mediaFolderRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
