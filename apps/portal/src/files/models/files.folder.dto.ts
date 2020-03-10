/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { UserEntity } from '../../user/user.entity';
// #endregion

// #region FilesFolder
export enum FILES_RIGHT {
  READ = 1,
  WRITE = 2,
  ALL = 3,
}

export interface FilesFolder {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  user?: UserEntity;

  pathname: string;
}

export interface FilesFolderResponse extends FilesFolder {
  right: FILES_RIGHT;
}
// #endregion
