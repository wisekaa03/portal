/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { LoginService, Gender } from '../../../lib/types';
// eslint-disable-next-line import/no-cycle
import { ProfileEntity } from '../profile.entity';
// #endregion

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

  company: string;

  department?: string;

  otdel?: string;

  title: string;

  manager?: ProfileEntity | Promise<ProfileEntity | undefined>;

  telephone: string;

  workPhone: string;

  mobile: string;

  companyEng: string;

  nameEng: string;

  departmentEng: string;

  otdelEng: string;

  positionEng: string;

  disabled: boolean;

  notShowing: boolean;

  thumbnailPhoto?: string | Promise<string | undefined>;

  thumbnailPhoto40?: string | Promise<string | undefined>;

  createdAt?: Date;

  updatedAt?: Date;
}
