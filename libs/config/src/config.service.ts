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
  private readonly envConfig: EnvConfig<string | number | boolean>;

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
  private validateInput(environmentConfig: dotenv.DotenvParseOutput): EnvConfig<string | number | boolean> {
    const environmentVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any().empty('').default('development').optional(),

      PORT: Joi.number().integer().default(80).required(),
      PORT_SSL: Joi.number().integer().empty('').default(0).optional(),
      DOMAIN: Joi.string().empty('').default('example.com').required(),
      LOGLEVEL: Joi.string().empty('').default('debug').required(),
      DEVELOPMENT: Joi.boolean().empty('').default(true).required(),

      DATABASE_URI: Joi.string().required(),
      DATABASE_URI_RD: Joi.string().required(),
      DATABASE_SCHEMA: Joi.string().empty('').default('public').optional(),
      DATABASE_SYNCHRONIZE: Joi.boolean().empty('').default(false).optional(),
      DATABASE_DROP_SCHEMA: Joi.boolean().empty('').default(false).optional(),
      DATABASE_LOGGING: Joi.string().empty('').default(true).optional(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean().empty('').default(false).optional(),
      DATABASE_REDIS_URI: Joi.string().empty('').optional(),
      DATABASE_REDIS_TTL: Joi.number().empty('').default(60).optional(),

      HTTP_REDIS_URI: Joi.string().empty('').optional(),
      HTTP_REDIS_TTL: Joi.number().empty('').default(60).optional(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number().empty('').default(1000).optional(),

      SESSION_NAME: Joi.string().empty('').default('portal').optional(),
      SESSION_SECRET: Joi.string().empty('').optional(),
      SESSION_REDIS_URI: Joi.string().required(),
      SESSION_COOKIE_TTL: Joi.number().empty('').default(3600).optional(),

      LDAP_REDIS_URI: Joi.string().empty('').optional(),
      LDAP_REDIS_TTL: Joi.number().empty('').default(3600).optional(),

      LDAP_URL: Joi.string().required(),
      LDAP_BIND_DN: Joi.string().required(),
      LDAP_BIND_PW: Joi.string().required(),
      LDAP_SEARCH_BASE: Joi.string().required(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string()
        .empty('')
        .default('(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))')
        .required(),
      LDAP_SEARCH_FILTER_ALL_GROUPS: Joi.string().empty('').default('objectClass=group').required(),
      LDAP_SEARCH_GROUP: Joi.string().empty('').default('(&(objectClass=group)(member={{dn}}))').required(),
      LDAP_SEARCH_USER: Joi.string().empty('').default('(sAMAccountName={{username}})').required(),

      MICROSERVICE_URL: Joi.string().required(),

      SOAP_URL: Joi.string().uri().empty('').optional(),
      SOAP_DOMAIN: Joi.string().empty('').optional(),

      OSTICKET_URL: Joi.any().empty('').optional(),

      NEXTCLOUD_URL: Joi.string().empty('').optional(),
      NEXTCLOUD_REDIS_URI: Joi.string().empty('').optional(),
      NEXTCLOUD_REDIS_TTL: Joi.number().empty('').optional(),

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
    return (this.envConfig[key] as unknown) as T;
  }
}
