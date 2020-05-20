/** @format */

//#region Imports Local
import { ConfigService } from '@app/config/config.service';

import { GroupEntity } from '@back/group/group.entity';
import { ProfileEntity } from '@back/profile/profile.entity';
import { UserEntity } from '@back/user/user.entity';
import { NewsEntity } from '@back/news/news.entity';
import { FilesFolderEntity } from '@back/files/files.folder.entity';
import { FilesEntity } from '@back/files/files.entity';
//#endregion

const entities = [GroupEntity, ProfileEntity, UserEntity, NewsEntity, FilesFolderEntity, FilesEntity];
// const entities = ['apps/portal/src/**/*.entity.ts'];
// const entities = ['./.next/nest/**/*.entity.js'];
// const migrations = dev ? ['src/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];

const configService = new ConfigService('.env');

module.exports = {
  name: 'default',
  type: 'postgres',
  replication: {
    master: { url: configService.get('DATABASE_URI') },
    slaves: [{ url: configService.get('DATABASE_URI_RD') }],
  },
  url: configService.get('DATABASE_URI'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USERNAME'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_DATABASE'),
  schema: configService.get('DATABASE_SCHEMA'),
  uuidExtension: 'pgcrypto',
  synchronize: configService.get('DATABASE_SYNCHRONIZE'),
  dropSchema: configService.get('DATABASE_DROP_SCHEMA'),
  logging: 'all',
  logger: 'simple-console',
  entities,
  migrationsRun: configService.get('DATABASE_MIGRATIONS_RUN'),
  cache: false,
  // migrations,
  // cli: {
  //   migrationsDir: 'migration',
  // },
};
