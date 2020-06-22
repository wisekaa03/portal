/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NextcloudClient } from 'nextcloud-link';
import { FileDetails } from 'nextcloud-link/compiled/source/types';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
//#endregion
//#region Imports Local
import { Files, FilesFolder, FilesFolderResponse, User } from '@lib/types';
import { ConfigService } from '@app/config';
//#endregion

interface CachedObject {
  folderFiles?: string;
}

@Injectable()
export class FilesService {
  nextCloud: NextcloudClient;
  private ttl: number;
  private cacheStore: cacheManager.Store;
  private cache: cacheManager.Cache;

  constructor(
    @InjectPinoLogger(FilesService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService, // private readonly userService: UserService,
  ) {
    this.ttl = configService.get<number>('NC_REDIS_TTL') || 900;
    this.cacheStore = redisStore.create({
      prefix: 'NC',
      url: configService.get<string>('NC_REDIS_URI') || '',
    });
    this.cache = cacheManager.caching({
      store: this.cacheStore,
      ttl: this.ttl,
    });

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
   * This is for a cache to slow NextCloud instance
   *
   * @param {User} user
   * @param {string} password
   * @param {string} cachedID user.username + <the function>
   * @param {CachedObject} object
   * @return {void}
   */
  cacheThis = async (user: User, password: string, cachedID: string, object: CachedObject): Promise<void> => {
    if (object.folderFiles) {
      this.cache.set(
        cachedID,
        await this.nextCloudAs(user, password).getFolderFileDetails(object.folderFiles),
        this.ttl,
      );
    }
  };

  /**
   * Get files in a folder
   *
   * @param {string} path of files
   * @return {FileDetails[]}
   */
  folderFiles = async (path: string, user: User, password: string): Promise<FileDetails[]> => {
    this.logger.info(`Files entity: path={${path}}`);
    const cachedID = `${user.loginIdentificator}-ff`;

    const cached: FileDetails[] = await this.cache.get<FileDetails[]>(cachedID);
    if (cached) {
      this.cacheThis(user, password, cachedID, { folderFiles: path });

      return cached;
    }

    const folder = await this.nextCloudAs(user, password).getFolderFileDetails(path);
    this.cache.set<FileDetails[]>(cachedID, folder, this.ttl);

    return folder;
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
