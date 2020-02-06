/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { UserResponse } from '../user/user.entity';
// #endregion

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {}

  /**
   * GraphQL query: me
   *
   * @param req - request.User
   * @returns {UserResponseDTO}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@Context('req') req: Request): Promise<UserResponse | null> {
    return req.user as UserResponse;
  }

  /**
   * GraphQL mutation: login
   *
   * @param username - username
   * @param password - password
   * @returns {UserResponseDTO}
   * @throws {UnauthorizedException}
   */
  @Mutation()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') req: Request,
    // FIX: в GraphQLModule.forRoot({ context: ({ req, res }) => ({ req, res }) })
    @Context('res') res: Response,
  ): Promise<UserResponse | null> {
    const user = await this.authService.login({ username: username.toLowerCase(), password }, req);

    // Чтобы в дальнейшем был пароль, в частности, в SOAP
    user.passwordFrontend = password;

    req.logIn(user, (err: Error) => {
      if (err) {
        this.logService.error('Error when logging in:', JSON.stringify(err), 'AuthResolver');

        throw new UnauthorizedException(err, err.message);
      }
    });

    if (user.profile && user.profile.email) {
      await this.authService
        .loginEmail(user.profile.email, password)
        .then((response) => {
          if (response.data && response.data.sessid && response.data.sessauth) {
            const options = {
              // domain: '.portal.i-npz.ru',
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            res.cookie('roundcube_sessid', response.data.sessid, options);
            res.cookie('roundcube_sessauth', response.data.sessauth, options);

            user.mailSession = {
              sessid: response.data.sessid,
              sessauth: response.data.sessauth,
            };

            return true;
          }

          throw new Error('Undefined mailSession error.');
        })
        .catch((error: Error) => {
          this.logService.error('Unable to login in mail', JSON.stringify(error), 'AuthResolver');
        });
    }

    return user;
  }

  /**
   * GraphQL mutation: logout
   *
   * @returns {boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') req: Request): Promise<boolean | null> {
    this.logService.debug('User logout', 'AuthResolver');

    if (req.session) {
      req.logOut();
    }

    return true;
  }

  /**
   * GraphQL mutation: cacheReset
   *
   * @returns {boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async cacheReset(): Promise<boolean> {
    this.logService.debug('Cache reset', 'AuthResolver');

    return this.authService.cacheReset();
  }
}
