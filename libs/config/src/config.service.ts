/** @format */

//#region Imports NPM
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import Joi from '@hapi/joi';
import { Inject } from '@nestjs/common';
//#endregion
//#region Imports Local
//#endregion

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

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
   * JWT options
   */
  public static jwtConstants = {
    secret: 'whatThaFuck',
  };

  /**
   * Language
   */
  public i18nPath = 'apps/portal/src/i18n';

  public fallbackLanguage = 'ru';

  public i18nFilePattern = '*.json';

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(environmentConfig: EnvConfig<any>): EnvConfig<any> {
    const environmentVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any().empty('').optional(),

      PORT: Joi.number().integer().default(80).required(),
      PORT_SSL: Joi.number().integer().empty('').default(0).optional(),
      DOMAIN: Joi.string().empty('').default('example.com').required(),
      LOGLEVEL: Joi.string().empty('').default('debug').required(),
      DEVELOPMENT: Joi.boolean().empty('').default(true).required(),

      DATABASE_URI: Joi.string().required(),
      DATABASE_URI_RD: Joi.string().required(),
      DATABASE_SCHEMA: Joi.string().required(),
      DATABASE_SYNCHRONIZE: Joi.boolean().required(),
      DATABASE_DROP_SCHEMA: Joi.boolean().required(),
      DATABASE_LOGGING: Joi.string().empty('').optional(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean().empty('').optional(),
      DATABASE_REDIS_URI: Joi.string().required(),
      DATABASE_REDIS_TTL: Joi.number().empty('').optional(),

      HTTP_REDIS_URI: Joi.string().empty('').optional(),
      HTTP_REDIS_TTL: Joi.number().empty('').optional(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number().empty('').optional(),

      SESSION_NAME: Joi.string().empty('').default('portal').optional(),
      SESSION_SECRET: Joi.string().empty('').optional(),
      SESSION_REDIS_URI: Joi.string().empty('').optional(),
      SESSION_COOKIE_TTL: Joi.number().required(),

      LDAP_REDIS_URI: Joi.string().required(),
      LDAP_REDIS_TTL: Joi.number().empty('').optional(),

      LDAP_URL: Joi.string().required(),
      LDAP_BIND_DN: Joi.string().required(),
      LDAP_BIND_PW: Joi.string().required(),
      LDAP_SEARCH_BASE: Joi.string().required(),
      LDAP_SEARCH_FILTER: Joi.string().required(),
      LDAP_SEARCH_GROUP: Joi.string().required(),
      LDAP_SEARCH_BASE_ALL_USERS: Joi.string().required(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string().required(),

      MICROSERVICE_URL: Joi.string().required(),

      SOAP_URL: Joi.string().uri().optional(),
      SOAP_DOMAIN: Joi.string().optional(),

      OSTICKET_URL: Joi.any(),

      NEXTCLOUD_URL: Joi.string().required(),

      NEWS_URL: Joi.string().empty('').optional(),
      NEWS_API_URL: Joi.string().empty('').optional(),

      MAIL_URL: Joi.string().empty('').optional(),
      MAIL_LOGIN_URL: Joi.string().empty('').optional(),

      MEETING_URL: Joi.string().empty('').optional(),
    });

    const { error, value: validatedEnvironmentConfig } = environmentVarsSchema.validate(environmentConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvironmentConfig;
  }

  get<T>(key: string): T {
    return this.envConfig[key] as T;
  }
}
