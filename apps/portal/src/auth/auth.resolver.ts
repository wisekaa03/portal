/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { Login, LoginEmail } from '@lib/types/auth';
import { User } from '@lib/types/user.dto';
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { GQLError, GQLErrorCode } from '@back/shared/gqlerror';
import { AuthService } from './auth.service';
// #endregion

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * This a self user.
   *
   * @async
   * @method me
   * @returns {User} User in database
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
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
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<Login> {
    let email: LoginEmail = { login: false };

    const user = await this.authService
      .login({ username: username.toLowerCase(), password })
      .catch(async (error: Error) => {
        throw await GQLError({ code: GQLErrorCode.UNAUTHENTICATED_LOGIN, error, i18n: this.i18n });
      });

    req.logIn(user, async (error: Error) => {
      if (error) {
        this.logService.error('Error when logging in:', error, AuthResolver.name);

        throw await GQLError({ code: GQLErrorCode.UNAUTHENTICATED_LOGIN, error, i18n: this.i18n });
      }
    });

    if (user.profile.email) {
      email = await this.authService.loginEmail(user.profile.email, password, req, res).catch((error: Error) => {
        this.logService.error('Unable to login in mail', error, AuthResolver.name);

        return {
          login: false,
          error: error.toString(),
        };
      });
    }

    req!.session!.password = password;

    return { user, email };
  }

  /**
   * Login user in a email software. Throws error if login is incorrect.
   *
   * @async
   * @method loginEmail
   * @returns {boolean} True if a login successfull
   * @throws {GraphQLError}
   */
  @Query()
  async loginEmail(
    @Context('req') req: Request,
    @Context('res') res: Response,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<LoginEmail> {
    return this.authService.loginEmail(user?.profile.email || '', password || '', req, res).catch((error: Error) => {
      this.logService.error('Unable to login in mail', error, AuthResolver.name);

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
  async logout(@Context('req') req: Request): Promise<boolean> {
    this.logService.debug('User logout', AuthResolver.name);

    if (req.session) {
      req.logOut();

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
  async cacheReset(): Promise<boolean> {
    this.logService.debug('Cache reset', AuthResolver.name);

    return this.authService.cacheReset();
  }
}
