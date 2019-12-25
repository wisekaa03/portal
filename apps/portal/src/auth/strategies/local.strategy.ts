/** @format */

// #region Imports NPM
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { AuthService } from '../auth.service';
import { UserResponse } from '../../user/user.entity';
// #endregion

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  validate = async (_username: string, _password: string, request: Express.Request): Promise<UserResponse> =>
    this.authService.validate(request);
}
