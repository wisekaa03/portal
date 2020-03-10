/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { FileUpload } from 'graphql-upload';
import { UserEntity } from '../../user/user.entity';
import { FilesFolderEntity } from '../files.folder.entity';
// #endregion

// #region Profile
export interface Files {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  title: string;

  folder?: FilesFolderEntity | string;
  filename?: string;
  mimetype?: string;

  content?: Promise<FileUpload>;
}
// #endregion
