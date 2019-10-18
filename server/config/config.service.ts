/** @format */

// #region Imports NPM
import dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as Joi from '@hapi/joi';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { JwtModuleOptions } from '@nestjs/jwt';
// #endregion

export interface EnvConfig {
  [key: string]: string;
}

const dev = process.env.NODE_ENV !== 'production';

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(readFileSync(filePath));
    this.envConfig = this.validateInput(config);

    this.jwtPrivateKey = readFileSync(join(__dirname, dev ? '../..' : '../../..', 'jwt.private.pem'), 'utf8');

    this.jwtPublicKey = readFileSync(join(__dirname, dev ? '../..' : '../../..', 'jwt.public.pem'), 'utf8');

    this.jwtStrategyOptions = {
      ...this.jwtStrategyOptions,
      secretOrKey: this.jwtPublicKey,
    };

    this.jwtModuleOptions = {
      ...this.jwtModuleOptions,
      privateKey: this.jwtPrivateKey,
      publicKey: this.jwtPublicKey,
    };
  }

  /**
   * Reads JWT public and secret key
   */
  public jwtSignOptions: jwt.SignOptions = {
    expiresIn: '1h',
    algorithm: 'RS256',
  };

  public jwtVerifyOptions: any | jwt.VerifyOptions = {
    algorithms: ['RS256'],
    ignoreExpiration: false,
  };

  public jwtStrategyOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() /* ExtractJwt.fromHeader('cookie')  */,
    secretOrKey: undefined, // Public Key
    ...this.jwtVerifyOptions,
  };

  public jwtModuleOptions: JwtModuleOptions = {
    signOptions: { ...this.jwtSignOptions },
    verifyOptions: { ...this.jwtVerifyOptions },
  };

  public jwtPrivateKey: string;

  public jwtPublicKey: string;

  /**
   * Language
   */
  public i18nPath = 'server/i18n';

  public fallbackLanguage = 'ru';

  i18nFilePattern = '*.json';

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any()
        .default('development')
        .empty(),
      PORT: Joi.number()
        .default(4000)
        .empty(),
      PORT_DEBUGGER: Joi.number()
        .default(9229)
        .empty(),
      HOST: Joi.string()
        .default('0.0.0.0')
        .empty(),
      DATABASE_CONNECTION: Joi.string()
        .default('postgres')
        .empty(),
      DATABASE_HOST: Joi.string()
        .default('localhost')
        .empty(),
      DATABASE_PORT: Joi.number()
        .default(5432)
        .empty(),
      DATABASE_USERNAME: Joi.string()
        .default('portal')
        .empty(),
      DATABASE_PASSWORD: Joi.string()
        .default('portalpwd')
        .empty(),
      DATABASE_DATABASE: Joi.string()
        .default('portaldb')
        .empty(),
      DATABASE_SCHEMA: Joi.string()
        .default('public')
        .empty(),
      DATABASE_SYNCHRONIZE: Joi.string()
        .default('true')
        .empty(),
      DATABASE_DROP_SCHEMA: Joi.string()
        .default('true')
        .empty(),
      DATABASE_LOGGING: Joi.string()
        .default('true')
        .empty(),
      DATABASE_MIGRATIONS_RUN: Joi.string()
        .default('false')
        .empty(),
      DATABASE_CACHE: Joi.string()
        .default('true')
        .empty(),

      HTTP_REDIS_HOST: Joi.string()
        .default('localhost')
        .empty(),
      HTTP_REDIS_PORT: Joi.number()
        .default(6379)
        .empty(),
      HTTP_REDIS_TTL: Joi.number()
        .default(3)
        .empty(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number()
        .default(200)
        .empty(),
      HTTP_REDIS_DB: Joi.number()
        .default(0)
        .empty(),
      HTTP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .empty(),
      HTTP_REDIS_PREFIX: Joi.string()
        .allow('')
        .empty(),

      LDAP_REDIS_HOST: Joi.string()
        .default('localhost')
        .empty(),
      LDAP_REDIS_PORT: Joi.number()
        .default(6379)
        .empty(),
      LDAP_REDIS_TTL: Joi.number()
        .default(3)
        .empty(),
      LDAP_REDIS_DB: Joi.number()
        .default(0)
        .empty(),
      LDAP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .empty(),

      SESSION_SECRET: Joi.string()
        .default('portal')
        .empty(),
      SESSION_REDIS_HOST: Joi.string()
        .default('localhost')
        .empty(),
      SESSION_REDIS_PORT: Joi.number()
        .default(6379)
        .empty(),
      SESSION_REDIS_DB: Joi.number()
        .default(0)
        .empty(),
      SESSION_REDIS_PASSWORD: Joi.string()
        .allow('')
        .empty(),
      SESSION_COOKIE_TTL: Joi.number()
        .default(24)
        .empty(),

      LDAP_URL: Joi.string()
        .default('ldap://activedirectory:389')
        .empty(),
      LDAP_BIND_DN: Joi.string()
        .default('CN=Administrator,DC=example,DC=local')
        .empty(),
      LDAP_BIND_PW: Joi.string()
        .default('PaSsWoRd123')
        .empty(),
      LDAP_SEARCH_BASE: Joi.string()
        .default('DC=example,DC=local')
        .empty(),
      LDAP_SEARCH_FILTER: Joi.string()
        .default('(sAMAccountName={{username}})')
        .empty(),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
