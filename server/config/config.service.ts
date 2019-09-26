/** @format */

// #region Imports NPM
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from '@hapi/joi';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { JwtModuleOptions } from '@nestjs/jwt';
// #endregion

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(readFileSync(filePath));
    this.envConfig = this.validateInput(config);

    this.jwtPrivateKey = readFileSync(`${__dirname}/../../jwt.private.pem`, 'utf8');

    this.jwtPublicKey = readFileSync(`${__dirname}/../../jwt.public.pem`, 'utf8');

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
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any().default('development'),
      PORT: Joi.number()
        .default(4000)
        .required(),
      HOST: Joi.string()
        .default('http://localhost')
        .required(),
      DATABASE_CONNECTION: Joi.string().default('postgres'),
      DATABASE_HOST: Joi.string().default('localhost'),
      DATABASE_PORT: Joi.number().default(5432),
      DATABASE_USERNAME: Joi.string().default('portal'),
      DATABASE_PASSWORD: Joi.string().default('portalpwd'),
      DATABASE_DATABASE: Joi.string().default('portaldb'),
      DATABASE_SCHEMA: Joi.string().default('public'),
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
      REDIS_HOST: Joi.string().default('localhost'),
      REDIS_PORT: Joi.number()
        .default(6379)
        .empty(),
      REDIS_DB: Joi.number().default(0),
      REDIS_PASSWORD: Joi.string()
        .allow('')
        .empty(),
      REDIS_PREFIX: Joi.string()
        .allow('')
        .empty(),
      SESSION_SECRET: Joi.string()
        .default('portal')
        .required(),
      LDAP_URL: Joi.string()
        .default('ldap://activedirectory:389')
        .required(),
      LDAP_BIND_DN: Joi.string()
        .default('CN=Administrator,DC=example,DC=local')
        .required(),
      LDAP_BIND_PW: Joi.string()
        .default('PaSsWoRd123')
        .required(),
      LDAP_SEARCH_BASE: Joi.string()
        .default('DC=example,DC=local')
        .required(),
      LDAP_SEARCH_FILTER: Joi.string()
        .default('(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))')
        .required(),
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
