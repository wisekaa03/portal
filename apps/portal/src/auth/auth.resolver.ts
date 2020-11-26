/** @format */

//#region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, Inject, LoggerService, Logger } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Request, Response } from 'express';
//#endregion
//#region Imports Local
import { Login, LoginEmail, User, AvailableAuthenticationProfiles } from '@lib/types';
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
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  /**
   * Available Authentication Profiles
   *
   * @async
   * @method availableAuthenticationProfiles
   * @returns {AvailableAuthenticationProfiles[]} Profiles
   * @throws {Error}
   */
  @Query('availableAuthenticationProfiles')
  async availableAuthenticationProfiles(
    @Args('synchronization') synchronization?: boolean,
    @Args('newProfile') newProfile?: boolean,
  ): Promise<string[]> {
    return this.userService.availableAuthenticationProfiles(synchronization ?? false, newProfile ?? true);
  }

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
    @Args('domain') domain: string,
    @Context('req') request: Request,
    // @Context('res') response: Response,
  ): Promise<Login> {
    const usernameLOW = username.toLowerCase();
    const email: LoginEmail = { login: false };

    const user = await this.authService.login({
      username: usernameLOW,
      password,
      domain,
      loggerContext: { username: usernameLOW, headers: request.headers },
    });

    request.logIn(user, async (error: Error) => {
      if (error) {
        this.logger.error({
          message: `Error when logging in: ${error.toString()}`,
          error,
          context: AuthResolver.name,
          function: 'login',
          username,
          headers: request.headers,
        });

        throw new UnauthorizedException(__DEV__ ? error : undefined);
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
      this.logger.error({
        message: 'Unable to login in mail',
        error,
        context: AuthResolver.name,
        function: 'loginEmail',
        ...loggerContext,
      });

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
  async logout(@Context('req') request: Request, @CurrentUser() user?: User): Promise<boolean> {
    this.logger.log({
      message: 'User logout',
      context: AuthResolver.name,
      function: 'logout',
      username: user?.username,
      headers: request.headers,
    });

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
  async cacheReset(@Context('req') request: Request, @CurrentUser() user?: User): Promise<boolean> {
    const loggerContext = { username: user?.username, headers: request.headers };
    this.logger.log({ message: 'Cache reset', context: AuthResolver.name, function: 'cacheReset', ...loggerContext });

    return this.authService.cacheReset({ loggerContext });
  }
}
