/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { FileUpload } from 'graphql-upload';
import { UserEntity } from '../../user/user.entity';
import { MediaFolderEntity } from '../media.folder.entity';
// #endregion

// #region Profile
export interface Media {
  id?: string;
  createdUser?: UserEntity;
  updatedUser?: UserEntity;

  createdAt?: Date;
  updatedAt?: Date;

  title: string;

  folder?: MediaFolderEntity | string;
  filename?: string;
  mimetype?: string;

  content?: Promise<FileUpload>;
}
// #endregion
