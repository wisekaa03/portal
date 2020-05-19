/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { User } from './user.dto';
//#endregion

//#region FilesFolder
export enum FILES_RIGHT {
  READ = 1,
  WRITE = 2,
  ALL = 3,
}

export interface FilesFolder {
  id?: string;
  createdUser?: User;
  updatedUser?: User;

  createdAt?: Date;
  updatedAt?: Date;

  user?: User;

  pathname: string;
}

export interface FilesFolderResponse extends FilesFolder {
  right: FILES_RIGHT;
}
//#endregion
