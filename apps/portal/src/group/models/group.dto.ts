/** @format */

/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService } from '../../shared/interfaces';
// #endregion

// #region Group
export interface Group {
  id?: string;

  name: string;

  dn: string;

  loginService: LoginService;

  // in ldap, we store a GUID entry
  loginIdentificator: string;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion
