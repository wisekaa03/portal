/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
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
   * @returns {boolean} True if a login successfull
   * @throws {GraphQLError}
   */
  @Query()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') req: Request,
  ): Promise<boolean> {
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

    req!.session!.password = password;

    return true;
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
    @CurrentUser() user: User,
    @PasswordFrontend() password: string,
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<boolean> {
    if (user.profile.email) {
      return this.authService
        .loginEmail(user.profile.email, password)
        .then((response) => {
          const { sessid, sessauth } = response.data;
          if (sessid && sessauth) {
            const options = {
              // domain: '.portal.i-npz.ru',
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            res.cookie('roundcube_sessid', sessid, options);
            res.cookie('roundcube_sessauth', sessauth, options);

            req!.session!.mailSession = {
              sessid,
              sessauth,
            };

            return true;
          }

          throw new Error('Undefined mailSession error.');
        })
        .catch((error: Error) => {
          this.logService.error('Unable to login in mail', error, AuthResolver.name);

          return false;
        });
    }

    return false;
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
