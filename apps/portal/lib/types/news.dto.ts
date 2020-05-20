/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { User } from './user.dto';
//#endregion

//#region Profile
export interface News {
  id?: string;

  createdAt?: Date;

  updatedAt?: Date;

  title: string;

  excerpt: string;

  content: string;

  user?: User;
}
//#endregion
