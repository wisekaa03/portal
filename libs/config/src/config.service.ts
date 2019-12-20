/** @format */

// #region Imports NPM
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from '@hapi/joi';
import { Inject } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

export interface EnvConfig<T> {
  [key: string]: T;
}

export class ConfigService {
  private readonly envConfig: EnvConfig<any>;

  constructor(@Inject('CONFIG_OPTIONS') private readonly filePath: string) {
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
        .optional()
        .empty(),
      PORT: Joi.number()
        .integer()
        .optional()
        .empty(),
      PORT_DEBUGGER: Joi.number()
        .integer()
        .optional()
        .empty(),
      HOST: Joi.string()
        .optional()
        .empty(),
      DATABASE_URI: Joi.string()
        .optional()
        .empty(),
      DATABASE_URI_RD: Joi.string()
        .optional()
        .empty(),
      DATABASE_SCHEMA: Joi.string()
        .optional()
        .empty(),
      DATABASE_SYNCHRONIZE: Joi.boolean()
        .optional()
        .empty(),
      DATABASE_DROP_SCHEMA: Joi.boolean()
        .optional()
        .empty(),
      DATABASE_LOGGING: Joi.string()
        .optional()
        .empty(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean()
        .optional()
        .empty(),
      DATABASE_REDIS_URI: Joi.string()
        .optional()
        .empty(),
      DATABASE_REDIS_TTL: Joi.number()
        .optional()
        .empty(),

      HTTP_REDIS_URI: Joi.string()
        .optional()
        .empty(),
      HTTP_REDIS_TTL: Joi.number()
        .optional()
        .empty(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number()
        .optional()
        .empty(),

      SESSION_SECRET: Joi.string()
        .optional()
        .empty(),
      SESSION_REDIS_URI: Joi.string()
        .optional()
        .empty(),
      SESSION_COOKIE_TTL: Joi.number()
        .optional()
        .empty(),

      LDAP_REDIS_URI: Joi.string()
        .optional()
        .empty(),
      LDAP_REDIS_TTL: Joi.number()
        .optional()
        .empty(),

      LDAP_URL: Joi.string()
        .optional()
        .empty(),
      LDAP_BIND_DN: Joi.string()
        .optional()
        .empty(),
      LDAP_BIND_PW: Joi.string()
        .optional()
        .empty(),
      LDAP_SEARCH_BASE: Joi.string()
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER: Joi.string()
        .optional()
        .empty(),
      LDAP_SEARCH_GROUP: Joi.string()
        .optional()
        .empty(),
      LDAP_SEARCH_BASE_ALL_USERS: Joi.string()
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string()
        .optional()
        .empty(),

      MICROSERVICE_URL: Joi.string()
        .optional()
        .empty(),
      MICROSERVICE_USER: Joi.string()
        .optional()
        .empty(),
      MICROSERVICE_PASS: Joi.string()
        .optional()
        .empty(),

      SOAP_URL: Joi.string()
        .optional()
        .empty(),
      SOAP_USER: Joi.string()
        .optional()
        .empty(),
      SOAP_PASS: Joi.string()
        .optional()
        .empty(),

      NEWS_URL: Joi.string()
        .optional()
        .empty(),
      NEWS_API_URL: Joi.string()
        .optional()
        .empty(),

      MAIL_URL: Joi.string()
        .optional()
        .empty(),
      MAIL_LOGIN_URL: Joi.string()
        .optional()
        .empty(),

      MEETING_URL: Joi.string()
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
