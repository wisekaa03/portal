/** @format */
/* eslint import/no-dynamic-require:0 */

// #region Imports NPM
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const Config = require(`./${dev ? 'server/' : '.nest/server/'}config/config.service`);
const Logger = require(`./${dev ? 'server/' : '.nest/server/'}logger/logger.service`);

const entities = dev ? ['server/**/*.entity.ts'] : ['.nest/**/*.entity.js'];
// const migrations = dev ? ['server/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];
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

const isCache = Boolean(configService.get('DATABASE_CACHE'));
let cache;
if (isCache) {
  cache = {
    type: 'redis',
    options: {
      host: configService.get('HTTP_REDIS_HOST'),
      port: configService.get('HTTP_REDIS_PORT'),
      // eslint-disable-next-line max-len
      db: configService.get('DATABASE_REDIS_CACHE_DB') ? parseInt(configService.get('DATABASE_REDIS_CACHE_DB'), 10) : 0,
      password: configService.get('HTTP_REDIS_PASSWORD') ? configService.get('HTTP_REDIS_PASSWORD') : undefined,
      prefix: configService.get('HTTP_REDIS_PREFIX') ? configService.get('HTTP_REDIS_PREFIX') : undefined,
    },
    duration: configService.get('HTTP_REDIS_TTL'),
  };
} else {
  cache = false;
}

logger.log('Using ORMconfig.js...', 'Database');

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
  cache,
  // migrations,
  // cli: {
  //   migrationsDir: 'migration',
  // },
};
