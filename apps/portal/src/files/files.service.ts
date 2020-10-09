/** @format */

//#region Imports NPM
import fs from 'fs';
import { resolve } from 'path';
import { tmpNameSync } from 'tmp';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Webdav from 'webdav-client';
import { NextcloudClient } from 'nextcloud-link';
import { FileUpload } from 'graphql-upload';
import CacheManager from 'cache-manager';
import RedisStore from 'cache-manager-ioredis';
import { RedisService } from 'nestjs-redis';
//#endregion
//#region Imports Local
import { User, FilesFile, FilesOptions, FilesFolder, Folder } from '@lib/types';
import { ConfigService } from '@app/config';
//#endregion

interface CachedObject {
  folderFiles?: string;
}

@Injectable()
export class FilesService {
  nextCloud: NextcloudClient;

  private ttl: number;
  private cache?: ReturnType<typeof CacheManager.caching>;

  private staticFolder: string;
  private staticFolderURL: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService, // private readonly userService: UserService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly redisService: RedisService, // private readonly userService: UserService,
  ) {
    this.staticFolder = resolve(__dirname, __DEV__ ? '../../..' : '../..', 'public/tmp');
    this.staticFolderURL = 'tmp';

    this.ttl = configService.get<number>('NEXTCLOUD_REDIS_TTL') || 900;
    const redisInstance = this.redisService.getClient('NEXTCLOUD');
    if (redisInstance) {
      this.cache = CacheManager.caching({
        store: RedisStore,
        redisInstance,
        ttl: this.ttl,
      });

      if (this.cache.store) {
        logger.debug('Redis connection: success', { context: FilesService.name, function: 'constructor' });
      } else {
        logger.error('Redis connection: not connected', { context: FilesService.name, function: 'constructor' });
      }
    }

    this.nextCloud = new NextcloudClient({
      url: configService.get<string>('NEXTCLOUD_URL'),
    });
  }

  /**
   * Fcking nextCloud in AD translate this UUID in other way
   */
  translateToNextCloud = (loginIdentificator: string): string =>
    loginIdentificator.replace(
      /^(..)(..)(..)(..)-(..)(..)-(..)(..)-(..)(..)-(..)(..)(..)(..)(..)(..)$/,
      '$1$2$3$4-$5$6-$7$8-$10$9-$16$15$14$13$12$11',
    );

  /**
   * Returns nextCloud instance
   *
   * @param {User} user
   * @param {string} password
   */
  nextCloudAs = (user: User, password: string): NextcloudClient => {
    const nextCloud = this.nextCloud.as(user.username, password);

    const nextCloudUUID = this.translateToNextCloud(user.loginIdentificator || 'not authenticated');

    nextCloud.webdavConnection.options.url = nextCloud.webdavConnection.options.url.replace(
      /(remote\.php\/dav\/.+\/)(.+)(\/)?$/,
      `$1${nextCloudUUID}$3`,
    );

    return nextCloud;
  };

  folder = async (path: string, lastPath: string, user: User, password: string): Promise<FilesFolder[]> =>
    this.nextCloudAs(user, password)
      .getFolderFileDetails(path, [
        {
          namespace: 'DAV:',
          namespaceShort: 'd',
          element: 'getetag',
        },
        {
          namespace: 'DAV:',
          namespaceShort: 'd',
          element: 'getcontenttype',
        },
        {
          namespace: 'DAV:',
          namespaceShort: 'd',
          element: 'resourcetype',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'id',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'fileid',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'permissions',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'favorite',
        },
        {
          namespace: 'http://nextcloud.org/ns',
          namespaceShort: 'nc',
          element: 'has-preview',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'comments-unread',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'comments-count',
        },
        // {
        //   namespace: 'http://owncloud.org/ns',
        //   namespaceShort: 'oc',
        //   element: 'comments-href',
        // },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'owner-id',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'owner-display-name',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'size',
        },
        {
          namespace: 'http://nextcloud.org/ns',
          namespaceShort: 'nc',
          element: 'mount-type',
        },
        {
          namespace: 'http://owncloud.org/ns',
          namespaceShort: 'oc',
          element: 'share-types',
        },
        {
          namespace: 'http://open-collaboration-services.org/ns',
          namespaceShort: 'ocs',
          element: 'share-permissions',
        },
      ])
      .then((folders) =>
        folders
          .map(
            (f) =>
              ({
                id: f.extraProperties?.id,
                fileId: f.extraProperties?.fileid,
                creationDate: f.creationDate && typeof f.creationDate === 'string' ? new Date(f.creationDate) : f.creationDate,
                lastModified: f.lastModified && typeof f.lastModified === 'string' ? new Date(f.lastModified) : f.lastModified,
                size: f.extraProperties?.size || f.size,
                name: f.name,
                type: f.type === 'directory' ? Folder.FOLDER : Folder.FILE,
                mime: f.extraProperties?.getcontenttype,
                etag: (f.extraProperties?.getetag as string).replace(/"/g, ''),
                permissions: f.extraProperties?.permissions,
                favorite: f.extraProperties?.favorite as number,
                hasPreview: f.extraProperties?.['has-preview'] === 'true',
                commentsUnread: f.extraProperties?.['comments-unread'] as number,
                commentsCount: f.extraProperties?.['comments-count'] as number,
                ownerId: f.extraProperties?.['owner-id'],
                ownerDisplayName: f.extraProperties?.['owner-display-name'],
                mount: f.extraProperties?.['mount-type'],
                resourceType:
                  f.extraProperties?.resourcetype &&
                  Array.isArray(f.extraProperties.resourcetype) &&
                  f.extraProperties.resourcetype.length > 0
                    ? f.extraProperties.resourcetype.map((element) => element.collection)
                    : [],
                shareTypes:
                  f.extraProperties?.['share-types'] &&
                  Array.isArray(f.extraProperties['share-types']) &&
                  f.extraProperties['share-types'].length > 0
                    ? f.extraProperties['share-types'].map((element) => element['share-type'])
                    : [],
                sharePermissions: f.extraProperties?.['share-permissions'],
              } as FilesFolder),
          )
          .filter((value) => value.name !== lastPath),
      );

  /**
   * Get files in a folder
   *
   * @async
   * @param {string} path of files
   * @return {FilesFolder[]}
   */
  folderFiles = async (user: User, password: string, path = '/', cache = true): Promise<FilesFolder[]> => {
    this.logger.info(`Files entity: path={${path}}`, { context: FilesService.name, function: 'folderFiles' });

    const lastPath =
      path === '/' || path === ''
        ? this.translateToNextCloud(user.loginIdentificator || 'not authenticated').slice(4)
        : (path.slice(-1) === '/' ? path.slice(0, -1).split('/').pop() : path.split('/').pop()) ||
          this.translateToNextCloud(user.loginIdentificator || 'not authenticated').slice(4);

    const cachedID = `files:${user.loginIdentificator}:${path}`;
    if (this.cache && cache) {
      const cached: FilesFolder[] = await this.cache.get<FilesFolder[]>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          const folderFilesSubscription = await this.folder(path, lastPath, user, password);
          this.pubSub.publish('folderFilesSubscription', {
            user: user.loginIdentificator,
            path,
            folderFilesSubscription,
          });
          if (this.cache) {
            this.cache.set<FilesFolder[]>(cachedID, folderFilesSubscription, { ttl: this.ttl });
          }
        })();

        return cached;
      }
    }

    const folderFilesSubscription = await this.folder(path, lastPath, user, password);
    this.pubSub.publish('folderFilesSubscription', { user: user.loginIdentificator, path, folderFilesSubscription });

    if (this.cache) {
      this.cache.set<FilesFolder[]>(cachedID, folderFilesSubscription, { ttl: this.ttl });
    }

    return folderFilesSubscription;
  };

  /**
   * Put file
   *
   * @async
   * @param {string} targetPath Target path of file
   * @param {Promise<FileUpload>} file File object
   * @return {void}
   * @throws NotFoundError
   */
  putFile = async (path: string, promiseFile: Promise<FileUpload>, user: User, password: string): Promise<boolean> => {
    this.logger.info(`Put files: path={${path}}`, { context: FilesService.name, function: 'putFile' });

    const { createReadStream } = await promiseFile;
    this.nextCloudAs(user, password).uploadFromStream(path, createReadStream());

    const folder = path.slice(0, path.lastIndexOf('/'));
    await this.folderFiles(user, password, folder, false);

    return true;
  };

  /**
   * Get file
   *
   * @async
   * @param {string} path Path of file
   * @param {FileOptions} options.sync
   * @return {FilesFile}
   * @throws {Error}
   */
  getFile = async (path: string, user: User, password: string, options?: FilesOptions, cache = true): Promise<FilesFile> => {
    this.logger.info(`Get files: path={${path}}`, { context: FilesService.name, function: 'getFile' });

    const cachedID = `file:${user.loginIdentificator}:${path}`;
    if (cache && this.cache) {
      const cached: FilesFile = await this.cache.get<FilesFile>(cachedID);
      if (cached && cached !== null && cached.temporaryFile) {
        try {
          fs.accessSync(cached.temporaryFile, fs.constants.R_OK);
          return { path: cached.path };
        } catch (error) {
          this.logger.error(`Files: no read access at "${path}": ${error.toString()}`, {
            error,
            context: FilesService.name,
            function: 'getFile',
          });
        }
      }
    }

    const temporaryFile = tmpNameSync({ tmpdir: this.staticFolder });
    const file = temporaryFile.slice(temporaryFile.lastIndexOf('/'));

    const ncPromise = this.nextCloudAs(user, password)
      .getReadStream(path)
      .then((stream: Webdav.Stream) => {
        if (stream) {
          return stream.pipe(fs.createWriteStream(temporaryFile));
        }

        throw new Error(`Files: not found: ${path}`);
      })
      .catch((error: string | Error) => {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(error);
      });

    if (options?.sync) {
      const nc = await ncPromise;
      if (!nc) {
        throw new Error(`Files: not found: ${path}`);
      }
      await new Promise((res) =>
        nc.on('finish', (callback: () => void) => {
          res(callback);
        }),
      );
    }

    if (this.cache) {
      this.cache.set<FilesFile>(cachedID, { path: `${this.staticFolderURL}${file}`, temporaryFile }, this.ttl);
    }

    return { path: `${this.staticFolderURL}${file}` };
  };
}
