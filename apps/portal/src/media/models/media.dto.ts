/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
import { MediaDirectoryEntity } from '../media.directory.entity';
// #endregion

// #region Profile
export interface Media {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  title: string;

  directory?: MediaDirectoryEntity | string;
  filename?: string;
  mimetype?: string;

  content?: Buffer;
}
// #endregion
