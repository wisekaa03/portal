/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { Gender } from './gender';
import { LoginService } from './login-service';
import { Contact } from './user.dto';
//#endregion

//#region Profile
export interface Profile {
  id?: string;
  contact?: Contact;

  loginService: LoginService;
  loginIdentificator: string;

  username: string;

  dn: string;

  fullName?: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday?: Date;

  gender?: Gender;

  country?: string;

  postalCode?: string;

  region?: string;

  town?: string;

  street?: string;

  room?: string;

  employeeID?: string;

  company?: string;

  management?: string;

  department?: string;

  division?: string;

  title?: string;

  managerId?: string;

  manager?: Profile | undefined;

  telephone?: string;

  workPhone?: string;

  mobile?: string;

  fax?: string;

  companyEng?: string;

  nameEng?: string;

  managementEng?: string;

  departmentEng?: string;

  divisionEng?: string;

  positionEng?: string;

  accessCard?: string;

  disabled: boolean;

  notShowing: boolean;

  thumbnailPhoto?: string | Promise<string | undefined> | any;

  thumbnailPhoto40?: string | Promise<string | undefined> | any;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface SearchSuggestions {
  name: string;
  avatar?: string;
}
//#endregion
