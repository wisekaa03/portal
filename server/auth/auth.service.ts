/** @format */

// #region Imports NPM
import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { JwtPayload } from './models/jwt-payload.interface';
import { UserResponse } from '../user/models/user.dto';
// eslint-disable-next-line import/no-cycle
import { UserService } from '../user/user.service';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public token = (payload: JwtPayload): string => this.jwtService.sign(payload);

  // TODO: ненужно это... но пока оставим
  public validate = async (payload: JwtPayload): Promise<UserResponse | null> => {
    // eslint-disable-next-line no-debugger
    debugger;

    return this.userService.read(payload.id);
  };
}
