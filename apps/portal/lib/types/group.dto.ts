/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { LoginService } from './login-service';
//#endregion

//#region Group
export interface Group {
  id?: string;

  name?: string;

  description?: string | null;

  dn?: string | null;

  loginService?: LoginService;
  loginIdentificator?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  __typename?: 'Group';
}
//#endregion
