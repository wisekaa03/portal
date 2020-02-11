/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region Profile
export interface MediaDirectory {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  user?: UserEntity;

  pathname: string;
}
// #endregion
