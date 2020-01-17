/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region Profile
export interface Media {
  id?: string;

  createdAt?: Date;

  updatedAt?: Date;

  title: string;

  file?: string;

  content?: Buffer;

  user?: UserEntity;
}
// #endregion
