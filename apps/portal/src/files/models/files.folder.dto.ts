/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region MediaFolder
export interface FilesFolder {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  user?: UserEntity;

  pathname: string;
}
// #endregion
