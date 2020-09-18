/** @format */

//#region Imports NPM
import { Resolver, Query, Args, Mutation, Context, Subscription } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { isEqual } from 'lodash';
//#endregion
//#region Imports Local
import { Login, LoginEmail, User, UserSettingsTaskFavorite } from '@lib/types';
import { ConfigService } from '@app/config';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
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
    @Inject('PUB_SUB') private pubSub: RedisPubSub,
    @InjectPinoLogger(AuthResolver.name) private readonly logger: PinoLogger,
  ) {}

  /**
   * Current User
   *
   * @async
   * @method me
   * @returns {User} Current User
   * @throws {GraphQLError}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async ping(@Context('req') request: Request, @CurrentUser() user?: User): Promise<Ping> {
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.id) {
      let me = (await this.userService.byId(user.id)) as any;
      delete me.groupIds;
      delete me.profileId;
      me = JSON.parse(JSON.stringify(me));
      if (!isEqual(me, user)) {
        request.logIn(me, (error: Error) => {
          if (error) {
            const message = error.toString();
            this.logger.error(`Error when pinging: ${message}`, message);
          }
        });
        this.pubSub.publish('me', { me });
      }
    } else {
      this.pubSub.publish('me', { me: null });
    }

    return { ping: Date.now() };
  }

  @Subscription('me')
  @UseGuards(GqlAuthGuard)
  async me(): Promise<AsyncIterator<User | null>> {
    return this.pubSub.asyncIterator<User | null>('me');
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
    const email: LoginEmail = { login: false };

    const user = await this.authService.login({ username: username.toLowerCase(), password }).catch(async (error: Error) => {
      throw new UnauthorizedException(error);
    });

    request.logIn(user, async (error: Error) => {
      if (error) {
        const message = error.toString();
        this.logger.error(`Error when logging in: ${message}`, message);

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
    return this.authService.loginEmail(user?.profile.email || '', password || '', request, response).catch((error: Error) => {
      this.logger.error('Unable to login in mail', error);

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
    this.logger.debug('User logout');

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
  async cacheReset(): Promise<boolean> {
    this.logger.debug('Cache reset');

    return this.authService.cacheReset();
  }
}
