/** @format */

//#region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { Login, LoginEmail, User, UserSettingsTaskFavorite } from '@lib/types';
import { ConfigService } from '@app/config';
import { CurrentUser, PasswordFrontend, getUsername } from '@back/user/user.decorator';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from '@back/user/user.service';
import { AuthService } from './auth.service';
//#endregion

interface Ping {
  ping: number;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Current User
   *
   * @async
   * @method me
   * @returns {User} Current User
   * @throws {GraphQLError}
   */
  @Query('me')
  @UseGuards(GqlAuthGuard)
  async me(@Context('req') request: Request): Promise<User> {
    return this.authService.validate(request);
  }

  /**
   * Login user with password provided. True if login successful. Throws error if login is incorrect.
   *
   * @async
   * @method login
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Login} The login response
   * @throws {GraphQLError}
   */
  @Query()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') request: Request,
    // @Context('res') response: Response,
  ): Promise<Login> {
    const loggerContext = getUsername(request);
    const email: LoginEmail = { login: false };

    const user = await this.authService.login({ username: username.toLowerCase(), password, loggerContext }).catch(async (error: Error) => {
      throw new UnauthorizedException(error);
    });

    request.logIn(user, async (error: Error) => {
      if (error) {
        this.logger.error(`Error when logging in: ${error.toString()}`, { error, context: AuthResolver.name, ...loggerContext });

        throw new UnauthorizedException(error);
      }
    });

    if (typeof request.session !== 'undefined') {
      request.session.password = password;
    }

    return { user, email };
  }

  /**
   * Login user in a email software. Throws error if login is incorrect.
   *
   * @async
   * @method loginEmail
   * @returns {boolean} True if a login successful
   * @throws {GraphQLError}
   */
  @Query()
  async loginEmail(
    @Context('req') request: Request,
    @Context('res') response: Response,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<LoginEmail> {
    const loggerContext = getUsername(request);
    return this.authService.loginEmail(user?.profile.email || '', password || '', request, response).catch((error: Error) => {
      this.logger.error('Unable to login in mail', { error, context: AuthResolver.name, ...loggerContext });

      return {
        login: false,
        error: error.toString(),
      };
    });
  }

  /**
   * Logout a user.
   *
   * @async
   * @method logout
   * @returns {boolean} The true/false of logout
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') request: Request): Promise<boolean> {
    this.logger.info('User logout', { context: AuthResolver.name, ...getUsername(request) });

    if (request.session) {
      request.logOut();

      return true;
    }

    return false;
  }

  /**
   * Cache reset.
   *
   * @async
   * @method cacheReset
   * @returns {boolean} Cache reset true/false
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async cacheReset(@Context('req') request: Request): Promise<boolean> {
    const loggerContext = getUsername(request);
    this.logger.info('Cache reset', { context: AuthResolver.name, ...loggerContext });

    return this.authService.cacheReset({ loggerContext });
  }
}
