/** @format */
/* eslint import/no-dynamic-require:0 */

// #region Imports NPM
const Config = require('./.next/nest/config/config.service');

const entities = ['./.next/nest/**/*.entity.js'];

// const migrations = dev ? ['src/migrations/*.migration.ts'] : ['.nest/migrations/*.migration.js'];
// #endregion

const configService = new Config.ConfigService(`${__dirname}/.env`);
let logging = configService.get('DATABASE_LOGGING');

if (logging === 'false') {
  logging = false;
} else if (logging === 'true') {
  logging = true;
} else {
  logging = JSON.parse(logging);
}

const isCache = Boolean(configService.get('DATABASE_CACHE'));
let cache;
if (isCache) {
  cache = {
    type: 'redis',
    options: {
      host: configService.get('DATABASE_REDIS_HOST'),
      port: configService.get('DATABASE_REDIS_PORT'),
      // eslint-disable-next-line max-len
      db: configService.get('DATABASE_REDIS_CACHE_DB') ? parseInt(configService.get('DATABASE_REDIS_CACHE_DB'), 10) : 0,
      password: configService.get('DATABASE_REDIS_PASSWORD') ? configService.get('DATABASE_REDIS_PASSWORD') : undefined,
      prefix: configService.get('DATABASE_REDIS_PREFIX') ? configService.get('DATABASE_REDIS_PREFIX') : undefined,
    },
    duration: configService.get('DATABASE_REDIS_TTL'),
  };
} else {
  cache = false;
}

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
  logging,
  logger: 'simple-console',
  entities,
  migrationsRun: configService.get('DATABASE_MIGRATIONS_RUN'),
  cache,
  // migrations,
  // cli: {
  //   migrationsDir: 'migration',
  // },
};
