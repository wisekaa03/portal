/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { LoginService, Gender, Address } from '../../../lib/types';
// #endregion

// #region User
export class Profile {
  id?: string;

  loginService: LoginService;

  loginIdentificator: string;

  username?: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday: Date;

  gender: Gender;

  addressPersonal: Address;

  company: string;

  title: string;

  telephone: string;

  workPhone: string;

  mobile: string;

  thumbnailPhoto?: Buffer;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion

// #region User response
export class ProfileResponse extends Profile {}
// #endregion
