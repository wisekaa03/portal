/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NextcloudClient } from 'nextcloud-link';
import { FileDetails } from 'nextcloud-link/compiled/source/types';
//#endregion
//#region Imports Local
import { Files, FilesFolder, FilesFolderResponse, User } from '@lib/types';
import { ConfigService } from '@app/config';
//#endregion

@Injectable()
export class FilesService {
  nextCloud: NextcloudClient;

  constructor(
    @InjectPinoLogger(FilesService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService, // private readonly userService: UserService,
  ) {
    this.nextCloud = new NextcloudClient({
      url: configService.get<string>('NEXTCLOUD_URL'),
    });
  }

  /**
   * Returns nextCloud instance
   * @param {User} user
   * @param {string} password
   */
  nextCloudAs = (user: User, password: string): NextcloudClient => {
    const nextCloud = this.nextCloud.as(user.username, password);

    const nextCloudUUID = user.loginIdentificator.replace(
      /^(..)(..)(..)(..)-(..)(..)-(..)(..)-(..)(..)-(..)(..)(..)(..)(..)(..)$/,
      '$1$2$3$4-$5$6-$7$8-$10$9-$16$15$14$13$12$11',
    );

    nextCloud.webdavConnection.options.url = nextCloud.webdavConnection.options.url.replace(
      /(remote\.php\/dav\/.+\/)(.+)(\/)?$/,
      `$1${nextCloudUUID}$3`,
    );

    return nextCloud;
  };

  /**
   * Get file(s)
   *
   * @param {string} path of files
   * @return {string[]}
   */
  files = async (path: string, user: User, password: string): Promise<FileDetails[]> => {
    this.logger.info(`Files entity: path={${path}}`);

    const nextCloud = this.nextCloudAs(user, password);

    return nextCloud.getFolderFileDetails(path);
  };

  /**
   * Edit file
   *
   * @param {Files}
   * @return {FilesEntity}
   */
  editFile = async ({ title, folder, filename, mimetype, updatedUser, id }: Files): Promise<string> => {
    this.logger.info(`Edit: ${JSON.stringify({ title, folder, filename, mimetype, updatedUser, id })}`);

    throw new Error('Not implemented');
  };

  /**
   * Delete files
   *
   * @param {string} - id of files
   * @return {boolean} - true/false of delete files
   */
  deleteFile = async (id: string): Promise<boolean> => {
    this.logger.info(`Edit: id={${id}}`);

    throw new Error('Not implemented');
  };

  /**
   * Get folder
   *
   * @param {UserResponse} user shared or user defined
   * @param {string} id of folder (optional)
   * @return {Promise<FilesFolderResponse[]>}
   */
  folder = async (user: User, id?: string): Promise<string[]> => {
    this.logger.info(`Folder: id={${id}}`);

    throw new Error('Not implemented');
  };

  /**
   * Edit folder
   *
   * @param {FilesFolder}
   * @return {Promise<FilesFolderResponse>}
   */
  editFolder = async ({ id, user, pathname, updatedUser }: FilesFolder): Promise<string> => {
    this.logger.info(
      `Edit: ${JSON.stringify({ pathname, id, user: user?.username, updatedUser: updatedUser?.username })}`,
    );

    throw new Error('Not implemented');
  };

  /**
   * Delete folder
   *
   * @param {string} id of folder
   * @return {Promise<string | undefined>} id of deleted folder
   */
  deleteFolder = async (id: string): Promise<string | undefined> => {
    this.logger.info(`Edit folder: id={${id}}`);

    throw new Error('Not implemented');
  };
}
