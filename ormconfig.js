/** @format */
/* eslint import/no-dynamic-require:0 */

// #region Imports NPM
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const entities = dev ? ['server/**/*.entity.ts'] : ['.nest/**/*.entity.js'];
const Config = require(`./${dev ? 'server/' : '.nest/'}config/config.service`);
// #endregion

const configService = new Config.ConfigService(path.join(process.cwd(), '.env'));

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
  logging: configService.get('DATABASE_LOGGING'),
  entities,
  migrationsRun: configService.get('DATABASE_MIGRATIONS_RUN'),
  cache: configService.get('DATABASE_CACHE'),
};
