/** @format */

// #region Imports NPM
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { User } from './user.dto';
import { FilesFolder } from './files.folder.dto';
// #endregion

// #region Profile
export interface Files {
  id?: string;
  createdUser?: User;
  updatedUser?: User;

  createdAt?: Date;
  updatedAt?: Date;

  title: string;

  folder?: FilesFolder | string;
  filename?: string;
  mimetype?: string;

  content?: Promise<FileUpload>;
}
// #endregion
