/** @format */

// #region Imports NPM
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from '@hapi/joi';
// #endregion

export interface EnvConfig<T> {
  [key: string]: T;
}

export class ConfigService {
  private readonly envConfig: EnvConfig<any>;

  constructor(filePath: string) {
    const config = dotenv.parse(readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Language
   */
  public i18nPath = 'apps/portal/src/i18n';

  public fallbackLanguage = 'ru';

  i18nFilePattern = '*.json';

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig<any>): EnvConfig<any> {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any()
        .default('development')
        .optional()
        .empty(),
      PORT: Joi.number()
        .integer()
        .default(4000)
        .optional()
        .empty(),
      PORT_DEBUGGER: Joi.number()
        .integer()
        .default(9229)
        .optional()
        .empty(),
      HOST: Joi.string()
        .default('0.0.0.0')
        .optional()
        .empty(),
      DATABASE_CONNECTION: Joi.string()
        .default('postgres')
        .optional()
        .empty(),
      DATABASE_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      DATABASE_PORT: Joi.number()
        .default(5432)
        .optional()
        .empty(),
      DATABASE_USERNAME: Joi.string()
        .default('portal')
        .optional()
        .empty(),
      DATABASE_PASSWORD: Joi.string()
        .default('portalpwd')
        .optional()
        .empty(),
      DATABASE_DATABASE: Joi.string()
        .default('portaldb')
        .optional()
        .empty(),
      DATABASE_SCHEMA: Joi.string()
        .default('public')
        .optional()
        .empty(),
      DATABASE_SYNCHRONIZE: Joi.boolean()
        .default(true)
        .optional()
        .empty(),
      DATABASE_DROP_SCHEMA: Joi.boolean()
        .default(true)
        .optional()
        .empty(),
      DATABASE_LOGGING: Joi.string()
        .default(true)
        .optional()
        .empty(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean()
        .default(false)
        .optional()
        .empty(),
      DATABASE_CACHE: Joi.boolean()
        .default(true)
        .optional()
        .empty(),
      DATABASE_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      DATABASE_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      DATABASE_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),
      DATABASE_REDIS_DB: Joi.number()
        .default(0)
        .optional()
        .empty(),
      DATABASE_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),

      HTTP_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      HTTP_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      HTTP_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number()
        .default(10000)
        .optional()
        .empty(),
      HTTP_REDIS_DB: Joi.number()
        .default(1)
        .optional()
        .empty(),
      HTTP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),
      HTTP_REDIS_PREFIX: Joi.string()
        .allow('')
        .optional()
        .empty(),

      SESSION_SECRET: Joi.string()
        .default('portal')
        .optional()
        .empty(),
      SESSION_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      SESSION_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      SESSION_REDIS_DB: Joi.number()
        .default(2)
        .optional()
        .empty(),
      SESSION_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),
      SESSION_COOKIE_TTL: Joi.number()
        .default(24)
        .optional()
        .empty(),

      LDAP_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      LDAP_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      LDAP_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),
      LDAP_REDIS_DB: Joi.number()
        .default(3)
        .optional()
        .empty(),
      LDAP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),

      LDAP_URL: Joi.string()
        .default('ldap://activedirectory:389')
        .optional()
        .empty(),
      LDAP_BIND_DN: Joi.string()
        .default('CN=Administrator,DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_BIND_PW: Joi.string()
        .default('PaSsWoRd123')
        .optional()
        .empty(),
      LDAP_SEARCH_BASE: Joi.string()
        .default('DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER: Joi.string()
        .default('(sAMAccountName={{username}})')
        .optional()
        .empty(),
      LDAP_SEARCH_BASE_ALL_USERS: Joi.string()
        .default('DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string()
        .default('(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))')
        .optional()
        .empty(),

      MICROSERVICE_URL: Joi.string()
        .default('nats://nats-cluster.production:4222')
        .optional()
        .empty(),
      MICROSERVICE_USER: Joi.string()
        .default('admin')
        .optional()
        .empty(),
      MICROSERVICE_PASS: Joi.string()
        .default('supersecret')
        .optional()
        .empty(),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get<T>(key: string): T {
    return this.envConfig[key] as T;
  }
}
