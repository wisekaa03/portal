/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// import { IsNotEmpty } from 'class-validator';
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { Profile } from '../../profile/models/profile.dto';
// eslint-disable-next-line import/no-cycle
import { UserEntity } from '../user.entity';
// #endregion

export interface BaseUser {
  id?: string;

  username: string;

  password?: string;

  disabled: boolean;

  isAdmin: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

// #region User
export interface User extends BaseUser {
  profile: Profile;
}
// #endregion

export interface UserToSave extends BaseUser {
  profile: Profile | string;
}

// #region User response
export interface UserResponse extends UserEntity {
  token: string;
}
// #endregion

// #region User login
export interface UserLogin {
  // @IsNotEmpty()
  username: string;

  // @IsNotEmpty()
  password: string;
}
// #endregion

// #region User register
export interface UserRegister {
  username: string;

  password: string;

  isAdmin: boolean;
}
// #endregion
