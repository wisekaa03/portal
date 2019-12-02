/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService, Gender } from '../../shared/interfaces';
// #endregion

// #region Profile
export interface Profile {
  id?: string;

  loginService: LoginService;

  // in ldap, we store a GUID entry
  loginIdentificator: string;

  username: string;

  dn: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday: Date;

  gender: Gender;

  country: string;

  postalCode: string;

  region: string;

  town: string;

  street: string;

  room: string;

  company: string;

  department?: string;

  otdel?: string;

  title: string;

  manager?: Profile;

  telephone: string;

  workPhone: string;

  mobile: string;

  fax: string;

  companyEng: string;

  nameEng: string;

  departmentEng: string;

  otdelEng: string;

  positionEng: string;

  disabled: boolean;

  notShowing: boolean;

  thumbnailPhoto?: string;

  thumbnailPhoto40?: string;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion
