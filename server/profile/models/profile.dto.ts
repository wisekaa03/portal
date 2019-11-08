/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// #endregion
// #region Imports Local
// #endregion

// #region Profile
export interface Profile {
  id?: string;

  loginService: LoginService;

  loginIdentificator: string;

  username: string;

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

// #region Gender
export enum Gender {
  UNKNOWN = 0,
  MAN = 1,
  WOMAN = 2,
}
// #endregion

// #region Login service
export enum LoginService {
  LOCAL = 'local',
  LDAP = 'ldap',
  GOOGLE = 'google',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
}
// #endregion
