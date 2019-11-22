/** @format */
/* eslint import/no-dynamic-require:0 */

// #region Imports NPM
const Config = require('./.next/nest/libs/config/src/config.service');

const entities = ['./.next/nest/apps/src/**/*.entity.js'];

// const migrations = dev ? ['src/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];
// #endregion

const configService = new Config.ConfigService(`${__dirname}/.env`);

console.log('Database: Using ORMconfig.js...');

module.exports = {
  name: 'default',
  type: configService.get('DATABASE_CONNECTION'),
  host: configService.get('DATABASE_HOST'),
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
