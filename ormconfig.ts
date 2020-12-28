/** @format */

//#region Imports NPM
import { resolve } from 'path';
//#endregion
//#region Imports Local
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from '@back/shared/logger.options';
import { TypeOrmLogger } from '@back/shared/typeorm.logger';
import { ConfigService } from '@app/config/config.service';
import { Group } from '@back/group/group.entity';
import { Profile } from '@back/profile/profile.entity';
import { User } from '@back/user/user.entity';
import { News } from '@back/news/news.entity';
//#endregion

const entities = [Group, Profile, User, News];
// const entities = ['apps/portal/src/**/*.entity.ts'];
// const entities = ['./.next/nest/**/*.entity.js'];
// const migrations = dev ? ['src/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];

const configService = new ConfigService(resolve('./.local/.env'));
const logger = WinstonModule.createLogger(winstonOptions());

export default {
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
  logger: new TypeOrmLogger(logger),
  entities,
  migrationsRun: configService.get('DATABASE_MIGRATIONS_RUN'),
  cache: false,
  // migrations,
  // cli: {
  //   migrationsDir: 'migration',
  // },
};
