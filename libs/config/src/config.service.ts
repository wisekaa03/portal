/** @format */

//#region Imports NPM
import type { DotenvParseOutput } from 'dotenv';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import Joi from 'joi';
import { Inject } from '@nestjs/common';
import { GraphQLSchema } from 'graphql/type/schema';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { CONFIG_OPTIONS } from './config.constants';
//#endregion

export interface EnvConfig<T> {
  [key: string]: T;
}

export class ConfigService {
  private readonly envConfig: EnvConfig<string | number | boolean>;
  private graphQLSchema!: GraphQLSchema;
  private httpSecure = false;
  private httpLogger: Logger | any = console;

  constructor(@Inject(CONFIG_OPTIONS) private readonly filePath: string) {
    const config = parse(readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * JWT options
   */
  public static jwtConstants = {
    secret: '1w2e3r4t5y5878uyu567',
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
  private validateInput(environmentConfig: DotenvParseOutput): EnvConfig<string | number | boolean> {
    const environmentVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any().empty('').default('development').optional(),

      PORT: Joi.number().integer().default(80).required(),
      DOMAIN: Joi.string().empty('').default('example.com').required(),
      DEVELOPMENT: Joi.boolean().empty('').default(true).optional(),

      LOG_LEVEL: Joi.string().empty('').default('debug').optional(),
      LOG_SERVER: Joi.string().empty('').default('').optional(),

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

      LDAP: Joi.any().empty('').required(),

      MICROSERVICE_URL: Joi.string().required(),

      TICKETS_URL: Joi.string().uri().empty('').optional(),
      TICKETS_REDIS_TTL: Joi.number().empty('').default(60).optional(),
      TICKETS_REDIS_URI: Joi.string().empty('').optional(),

      REPORTS_URL: Joi.string().uri().empty('').optional(),
      REPORTS_REDIS_TTL: Joi.number().empty('').default(60).optional(),
      REPORTS_REDIS_URI: Joi.string().empty('').optional(),

      DOCFLOW_URL: Joi.string().uri().empty('').optional(),
      DOCFLOW_REDIS_TTL: Joi.number().empty('').default(60).optional(),
      DOCFLOW_REDIS_URI: Joi.string().empty('').optional(),

      OSTICKET_URL: Joi.any().empty('').optional(),

      NEXTCLOUD_URL: Joi.string().empty('').optional(),
      NEXTCLOUD_REDIS_URI: Joi.string().empty('').optional(),
      NEXTCLOUD_REDIS_TTL: Joi.number().empty('').default(60).optional(),
      MAX_FILE_SIZE: Joi.number().empty('').default(250000000).optional(),

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

  public set secure(secure: boolean) {
    this.httpSecure = secure;
  }
  public get secure(): boolean {
    return this.httpSecure;
  }

  public set schema(schema: GraphQLSchema) {
    this.graphQLSchema = schema;
  }
  public get schema(): GraphQLSchema {
    return this.graphQLSchema;
  }

  public set logger(logger: Logger | any) {
    this.httpLogger = logger;
  }
  public get logger(): Logger | any {
    return this.httpLogger;
  }

  get<T>(key: string): T {
    return (this.envConfig[key] as unknown) as T;
  }
}
