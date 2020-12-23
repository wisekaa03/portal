/** @format */

//#region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, Inject, LoggerService, Logger, ServiceUnavailableException } from '@nestjs/common';
// import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Request, Response } from 'express';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { ConfigService } from '@app/config';
import { CurrentUser, PasswordFrontend, getUsername } from '@back/user/user.decorator';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserService } from '@back/user/user.service';
import { Login, LoginEmail } from './graphql';
import { AuthService } from './auth.service';
//#endregion

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
   * @returns {string[]} Profiles string
   * @throws {Error}
   */
  @Query(() => [String])
  async availableAuthenticationProfiles(
    @Args('synchronization', { type: () => Boolean, nullable: true }) synchronization?: boolean,
    @Args('newProfile', { type: () => Boolean, nullable: true }) newProfile?: boolean,
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
  @Query(() => User)
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
  @Query(() => Login)
  async login(
    @Args('username', { type: () => String }) username: string,
    @Args('password', { type: () => String }) password: string,
    @Args('domain', { type: () => String }) domain: string,
    @Context('req') request: Request,
  ): Promise<Login> {
    const usernameLow = username.toLowerCase();
    const loginEmail: LoginEmail = { login: false };

    const user = await this.authService.login({
      username: usernameLow,
      password,
      domain,
      loggerContext: { username: usernameLow, headers: request.headers },
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

    return { user, loginEmail };
  }

  /**
   * Login user in a email software. Throws error if login is incorrect.
   *
   * @async
   * @method loginEmail
   * @returns {boolean} True if a login successful
   * @throws {GraphQLError}
   */
  @Query(() => LoginEmail)
  async loginEmail(
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Context('req') request: Request,
    @Context('res') response: Response,
  ): Promise<LoginEmail> {
    if (!user.profile.email) {
      throw new ServiceUnavailableException();
    }

    const loggerContext = getUsername(request);
    return this.authService.loginEmail(user.profile.email, password, request, response).catch((error: Error) => {
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
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') request: Request, @CurrentUser() user: User): Promise<boolean> {
    this.logger.log({
      message: 'User logout',
      context: AuthResolver.name,
      function: 'logout',
      username: user.username,
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
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cacheReset(@Context('req') request: Request, @CurrentUser() user: User): Promise<boolean> {
    const loggerContext = { username: user.username, headers: request.headers };
    this.logger.log({ message: 'Cache reset', context: AuthResolver.name, function: 'cacheReset', ...loggerContext });

    return this.authService.cacheReset({ loggerContext });
  }
}
