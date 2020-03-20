/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { Gender } from '../../shared/interfaces';
// #endregion

// #region Profile
export interface Profile {
  id?: string;

  username: string;

  dn: string;

  fullName?: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday: Date;

  gender: Gender;

  country?: string;

  postalCode?: string;

  region?: string;

  town?: string;

  street?: string;

  room?: string;

  employeeID?: string;

  company?: string;

  department?: string;

  otdel?: string;

  title?: string;

  managerId?: string;

  manager?: Profile | undefined;

  telephone?: string;

  workPhone?: string;

  mobile?: string;

  fax?: string;

  companyeng?: string;

  nameeng?: string;

  departmenteng?: string;

  otdeleng?: string;

  positioneng?: string;

  accessCard?: string;

  disabled: boolean;

  notShowing: boolean;

  thumbnailPhoto?: string | Promise<string | undefined> | any;

  thumbnailPhoto40?: string | Promise<string | undefined> | any;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion
