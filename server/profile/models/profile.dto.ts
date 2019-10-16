/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService, Gender } from '../../shared/server';
// #endregion

// #region User
export class ProfileDTO {
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

  addressPersonal: string;

  company: string;

  title: string;

  thumbnailPhoto?: Buffer;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion

// #region User response
export class ProfileResponseDTO extends ProfileDTO {}
// #endregion
