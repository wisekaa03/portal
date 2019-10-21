/** @format */
/* eslint import/no-dynamic-require:0 */

// #region Imports NPM
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const Config = require(`./${dev ? 'server/' : '.nest/server/'}config/config.service`);
const Logger = require(`./${dev ? 'server/' : '.nest/server/'}logger/logger.service`);

const entities = dev ? ['server/**/*.entity.ts'] : ['.nest/**/*.entity.js'];
const migrations = dev ? ['server/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];
// #endregion

const configService = new Config.ConfigService(path.join(process.cwd(), '.env'));
let logging = configService.get('DATABASE_LOGGING');

if (logging === 'false') {
  logging = false;
} else if (logging === 'true') {
  logging = true;
} else {
  logging = JSON.parse(logging);
}
const logger = logging && new Logger.LogService();

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
  logger,
  synchronize: configService.get('DATABASE_SYNCHRONIZE'),
  dropSchema: configService.get('DATABASE_DROP_SCHEMA'),
  logging,
  entities,
  migrationsRun: configService.get('DATABASE_MIGRATIONS_RUN'),
  cache: configService.get('DATABASE_CACHE'),
  migrations,
  cli: {
    migrationsDir: 'migration',
  },
};
