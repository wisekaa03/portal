/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
import { IsNotEmpty } from 'class-validator';
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { Profile } from '../../profile/models/profile.dto';
// #endregion

// #region User
export class User {
  id?: string;

  username: string;

  password?: string;

  isAdmin: boolean;

  profile?: Profile;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion

// #region User response
export class UserResponse extends User {
  token: string;
}
// #endregion

// #region User login
export class UserLogin {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
// #endregion

// #region User register
export class UserRegister {
  username: string;

  password: string;

  isAdmin: boolean;
}
// #endregion
