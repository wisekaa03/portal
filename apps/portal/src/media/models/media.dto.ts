/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region Profile
export interface Media {
  id?: string;
  user?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  title: string;

  directory?: string;
  filename?: string;
  mimetype?: string;

  content?: Buffer;
}
// #endregion
