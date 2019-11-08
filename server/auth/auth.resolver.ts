/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { User } from '../user/models/user.dto';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { LogService } from '../logger/logger.service';
import { UserResponse } from '../user/user.entity';
// #endregion

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private readonly logService: LogService) {}

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
   */
  @Mutation()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') req: Request,
  ): Promise<UserResponse | null> {
    const user = await this.authService.login({ username, password }, req);

    if (user) {
      req.logIn(user as User, (err: any) => {
        if (err) {
          this.logService.error('Error when logging in:', err);
        } else {
          this.logService.log(`User is logged in: ${user.username}`, 'AuthResolvers');
        }
      });

      return user;
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: logout
   *
   * @returns {boolean}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') req: Request): Promise<boolean | null> {
    this.logService.debug(`User logout`, 'AuthResolvers');

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
    this.logService.debug(`Cache reset`, 'AuthResolvers');

    return this.authService.cacheReset();
  }
}
