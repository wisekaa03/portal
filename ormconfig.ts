/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from '@back/shared/logger.options';
import { ConfigService } from '@app/config/config.service';
import { TypeOrmLogger } from '@app/portal/shared/typeorm.logger';
import { GroupEntity } from '@app/portal/group/group.entity';
import { ProfileEntity } from '@app/portal/profile/profile.entity';
import { UserEntity } from '@app/portal/user/user.entity';
import { NewsEntity } from '@app/portal/news/news.entity';
//#endregion

const entities = [GroupEntity, ProfileEntity, UserEntity, NewsEntity];
// const entities = ['apps/portal/src/**/*.entity.ts'];
// const entities = ['./.next/nest/**/*.entity.js'];
// const migrations = dev ? ['src/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];

const configService = new ConfigService('.local/.env');
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
