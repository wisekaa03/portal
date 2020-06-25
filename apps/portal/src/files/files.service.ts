/** @format */

//#region Imports NPM
import fs from 'fs';
import { resolve } from 'path';
import { tmpNameSync } from 'tmp';
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as Webdav from 'webdav-client';
import { NextcloudClient } from 'nextcloud-link';
import { FileDetails } from 'nextcloud-link/compiled/source/types';
import { FileUpload } from 'graphql-upload';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
//#endregion
//#region Imports Local
import { User, FilesFile, FilesOptions } from '@lib/types';
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
  private staticFolder: string;
  private staticFolderURL: string;

  constructor(
    @InjectPinoLogger(FilesService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService, // private readonly userService: UserService,
  ) {
    this.staticFolder = resolve(__dirname, __DEV__ ? '../../..' : '../..', 'public/tmp');
    this.staticFolderURL = 'tmp';

    this.ttl = configService.get<number>('NEXTCLOUD_REDIS_TTL') || 900;
    if (configService.get<string>('NEXTCLOUD_REDIS_URI')) {
      this.cacheStore = redisStore.create({
        prefix: 'NC',
        url: configService.get<string>('NEXTCLOUD_REDIS_URI'),
      });
      this.cache = cacheManager.caching({
        store: this.cacheStore,
        ttl: this.ttl,
      });
    }

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
  folderFiles = async (path: string, user: User, password: string, cache = true): Promise<FileDetails[]> => {
    this.logger.info(`Files entity: path={${path}}`);

    const cachedID = `${user.loginIdentificator}-${path}-ff`;
    if (this.cache && cache) {
      const cached: FileDetails[] = await this.cache.get<FileDetails[]>(cachedID);
      if (cached) {
        this.cacheThis(user, password, cachedID, { folderFiles: path });

        return cached;
      }
    }

    const folder = await this.nextCloudAs(user, password).getFolderFileDetails(path);
    if (this.cache) {
      this.cache.set<FileDetails[]>(cachedID, folder, this.ttl);
    }

    return folder;
  };

  /**
   * Put file
   *
   * @param {string} targetPath Target path of file
   * @param {Promise<FileUpload>} file File object
   * @return {void}
   * @throws NotFoundError
   */
  putFile = async (path: string, promiseFile: Promise<FileUpload>, user: User, password: string): Promise<void> => {
    this.logger.info(`Put files: path={${path}}`);

    const { createReadStream } = await promiseFile;

    await this.nextCloudAs(user, password).uploadFromStream(path, createReadStream());

    const folder = path.slice(0, path.lastIndexOf('/'));
    await this.folderFiles(folder, user, password, false);
  };

  /**
   * Get file
   *
   * @param {string} path Path of file
   * @param {FileOptions} options.sync
   * @return {FilesFile}
   * @throws {Error}
   */
  getFile = async (path: string, user: User, password: string, options?: FilesOptions): Promise<FilesFile> => {
    this.logger.info(`Get files: path={${path}}`);

    const temporaryFile = tmpNameSync({ tmpdir: this.staticFolder });
    const file = temporaryFile.slice(temporaryFile.lastIndexOf('/'));

    const wait = this.nextCloudAs(user, password)
      .getReadStream(path)
      .then((stream: Webdav.Stream) => {
        if (stream) {
          return stream.pipe(fs.createWriteStream(temporaryFile));
        }
        return;
      })
      .catch((error) => {
        throw new Error(error);
      });

    if (options?.sync) {
      const wait_ = await wait;
      if (!wait_) {
        throw new Error(`No such file: ${path}`);
      }
      await new Promise((resolve) =>
        wait_.on('finish', (callback: () => void) => {
          resolve(callback);
        }),
      );
    }

    return { path: `${this.staticFolderURL}${file}` };
  };
}
