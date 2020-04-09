/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
// #endregion
// #region Imports Local
import { Files, FilesFolder, FilesFolderResponse, User } from '@lib/types';
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { FilesEntity } from './files.entity';
import { FilesFolderEntity } from './files.folder.entity';
// #endregion

@Injectable()
export class FilesService {
  dbCacheTtl = 10000;

  constructor(
    private readonly logService: LogService,
    private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    @InjectRepository(FilesFolderEntity)
    private readonly filesFolderRepository: Repository<FilesFolderEntity>,
  ) {
    this.dbCacheTtl = this.configService.get<number>('DATABASE_REDIS_TTL');
  }

  /**
   * Get file(s)
   *
   * @param {string} id of files (optional)
   * @return {FilesEntity[]}
   */
  file = async (id?: string): Promise<FilesEntity[]> => {
    this.logService.log(`Files entity: id={${id}}`, 'FilesService');

    // TODO: сделать чтобы выводилось постранично
    return this.filesRepository.find(id ? { id } : undefined);
  };

  /**
   * Edit file
   *
   * @param {Files}
   * @return {FilesEntity}
   */
  editFile = async ({ title, folder, filename, mimetype, updatedUser, id }: Files): Promise<FilesEntity> => {
    this.logService.log(
      `Edit: ${JSON.stringify({ title, folder, filename, mimetype, updatedUser, id })}`,
      'FilesService',
    );

    const folderEntity = await this.filesFolderRepository.findOne(folder as string);

    const data = {
      title,
      folder: folderEntity,
      filename,
      mimetype,
      updatedUser,
      id,
    };

    return this.filesRepository.save(this.filesRepository.create(data)).catch((error) => {
      throw error;
    });
  };

  /**
   * Delete files
   *
   * @param {string} - id of files
   * @return {boolean} - true/false of delete files
   */
  deleteFile = async (id: string): Promise<boolean> => {
    this.logService.log(`Edit: id={${id}}`, 'FilesService');

    const deleteResult = await this.filesRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };

  /**
   * Get folder
   *
   * @param {UserResponse} user shared or user defined
   * @param {string} id of folder (optional)
   * @return {Promise<FilesFolderResponse[]>}
   */
  folder = async (user: User, id?: string): Promise<FilesFolderResponse[]> => {
    this.logService.log(`Folder: id={${id}}`, 'FilesService');

    const where: Record<any, any> = [];
    if (id) {
      where.push({ id, user });
      where.push({ id, user: IsNull() });
    } else {
      where.push({ user });
      where.push({ user: IsNull() });
    }

    const result = await this.filesFolderRepository
      .find({ where, cache: { id: 'folder', milliseconds: this.dbCacheTtl } })
      .then((folders: FilesFolderEntity[]) => folders.map((folder) => folder.toResponseObject()));

    return result;
  };

  /**
   * Edit folder
   *
   * @param {FilesFolder}
   * @return {Promise<FilesFolderResponse>}
   */
  editFolder = async ({ id, user, pathname, updatedUser }: FilesFolder): Promise<FilesFolderResponse> => {
    this.logService.log(
      `Edit: ${JSON.stringify({ pathname, id, user: user?.username, updatedUser: updatedUser?.username })}`,
      'FilesService',
    );

    // TODO: сделать чтобы одинаковые имена не появлялись на одном уровне вложенности
    // const folderPathname = await this.mediaFolderRepository.findOne({ pathname });

    let data = id ? await this.filesFolderRepository.findOne({ id }) : ({ createdUser: updatedUser } as FilesFolder);

    data = {
      ...data,
      pathname,
      user,
      updatedUser,
      id,
    };

    return this.filesFolderRepository
      .save(this.filesFolderRepository.create(data))
      .then(async (folder) => {
        await this.filesFolderRepository.manager.connection!.queryResultCache!.remove(['folder']);

        return folder.toResponseObject();
      })
      .catch((error: Error) => {
        throw error;
      });
  };

  /**
   * Delete folder
   *
   * @param {string} id of folder
   * @return {Promise<string | undefined>} id of deleted folder
   */
  deleteFolder = async (id: string): Promise<string | undefined> => {
    this.logService.log(`Edit folder: id={${id}}`, 'FilesService');

    const deleteResult = await this.filesFolderRepository.delete({ id });

    return !!deleteResult.affected ? id : undefined;
  };
}
