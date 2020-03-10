/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { FilesEntity } from './files.entity';
import { Files } from './models/files.dto';
import { FilesFolderEntity } from './files.folder.entity';
import { FilesFolder } from './models/files.folder.dto';
// #endregion

@Injectable()
export class FilesService {
  constructor(
    private readonly logService: LogService,
    // private readonly configService: ConfigService,
    // private readonly userService: UserService,
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    @InjectRepository(FilesFolderEntity)
    private readonly filesFolderRepository: Repository<FilesFolderEntity>,
  ) {}

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
   * @param {string} id of folder (optional)
   * @return {FilesFolderEntity[]}
   */
  folder = async (id?: string): Promise<FilesFolderEntity[]> => {
    this.logService.log(`Folder: id={${id}}`, 'FilesService');

    // TODO: сделать чтобы выводилось постранично
    // TODO: убрал id, пока выводим все каталоги
    // TODO: так же думаю надо сделать чтобы зависимые таблицы подтягивались всегда иначе ошибка ot null
    return this.filesFolderRepository.find({ relations: ['createdUser', 'updatedUser'] });
  };

  /**
   * Edit folder
   *
   * @param {FilesFolder}
   * @return {FilesFolderEntity}
   */
  editFolder = async ({ id, user, pathname, updatedUser }: FilesFolder): Promise<FilesFolderEntity> => {
    this.logService.log(`Edit: ${JSON.stringify({ pathname, id, user, updatedUser })}`, 'FilesService');

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

    return this.filesFolderRepository.save(this.filesFolderRepository.create(data)).catch((error: Error) => {
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
    this.logService.log(`Edit folder: id={${id}}`, 'FilesService');

    const deleteResult = await this.filesFolderRepository.delete({ id });

    return !!(deleteResult.affected && deleteResult.affected > 0);
  };
}
