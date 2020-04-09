/** @format */

// #region Imports NPM
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { User } from '@lib/types/user.dto';
import { AuthService } from '../auth.service';
// #endregion

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  validate = async (_username: string, _password: string, req: Request): Promise<User> =>
    this.authService.validate(req);
}
