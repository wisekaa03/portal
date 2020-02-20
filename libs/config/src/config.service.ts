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
      NODE_ENV: Joi.any().optional(),
      PORT: Joi.number()
        .integer()
        .required(),
      PORT_DEBUG: Joi.number()
        .integer()
        .optional(),
      DATABASE_URI: Joi.string().required(),
      DATABASE_URI_RD: Joi.string().required(),
      DATABASE_SCHEMA: Joi.string().required(),
      DATABASE_SYNCHRONIZE: Joi.boolean().required(),
      DATABASE_DROP_SCHEMA: Joi.boolean().required(),
      DATABASE_LOGGING: Joi.string().optional(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean().optional(),
      DATABASE_REDIS_URI: Joi.string().required(),
      DATABASE_REDIS_TTL: Joi.number().optional(),

      HTTP_REDIS_URI: Joi.string().optional(),
      HTTP_REDIS_TTL: Joi.number().optional(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number().optional(),

      SESSION_NAME: Joi.string()
        .optional()
        .default('portal'),
      SESSION_SECRET: Joi.string().optional(),
      SESSION_REDIS_URI: Joi.string().optional(),
      SESSION_COOKIE_TTL: Joi.number().required(),

      LDAP_REDIS_URI: Joi.string().required(),
      LDAP_REDIS_TTL: Joi.number().optional(),

      LDAP_URL: Joi.string().required(),
      LDAP_BIND_DN: Joi.string().required(),
      LDAP_BIND_PW: Joi.string().required(),
      LDAP_SEARCH_BASE: Joi.string().required(),
      LDAP_SEARCH_FILTER: Joi.string().required(),
      LDAP_SEARCH_GROUP: Joi.string().required(),
      LDAP_SEARCH_BASE_ALL_USERS: Joi.string().required(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string().required(),

      MICROSERVICE_URL: Joi.string().required(),

      SOAP_URL: Joi.string().required(),
      SOAP_USER: Joi.string().optional(),
      SOAP_PASS: Joi.string().optional(),
      SOAP_DOMAIN: Joi.string().optional(),

      NEWS_URL: Joi.string().optional(),
      NEWS_API_URL: Joi.string().optional(),

      MAIL_URL: Joi.string().optional(),
      MAIL_LOGIN_URL: Joi.string().optional(),

      MEETING_URL: Joi.string().optional(),
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
