/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { Gender } from './gender';
import { LoginService } from './login-service';
import { Contact } from './user.dto';
//#endregion

export interface Profile {
  id?: string;
  contact?: Contact;

  loginService?: LoginService;
  loginIdentificator?: string | null;

  username?: string | null;

  dn?: string | null;

  fullName?: string | null;

  firstName?: string | null;

  lastName?: string | null;

  middleName?: string | null;

  email?: string | null;

  birthday?: string | null;

  gender?: Gender | null;

  country?: string | null;

  postalCode?: string | null;

  region?: string | null;

  town?: string | null;

  street?: string | null;

  room?: string | null;

  employeeID?: string | null;

  company?: string | null;

  management?: string | null;

  department?: string | null;

  division?: string | null;

  title?: string | null;

  managerId?: string | null;

  manager?: Profile | null;

  telephone?: string | null;

  workPhone?: string | null;

  mobile?: string | null;

  fax?: string | null;

  companyEng?: string | null;

  nameEng?: string | null;

  managementEng?: string | null;

  departmentEng?: string | null;

  divisionEng?: string | null;

  positionEng?: string | null;

  accessCard?: string | null;

  disabled?: boolean;

  notShowing?: boolean;

  thumbnailPhoto?: string | Promise<string | null> | unknown;

  thumbnailPhoto40?: string | Promise<string | null> | unknown;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  __typename?: 'Profile';
}

export interface SearchSuggestions {
  name: string;
  avatar?: string;
}

export interface ProfileInput extends Omit<Profile, 'loginService' | 'loginIdentificator' | 'dn' | 'updatedAt' | 'createdAt'> {
  contact: Contact;
}

export const isProfileInput = (profile: unknown): profile is ProfileInput =>
  typeof profile === 'object' &&
  profile !== null &&
  'id' in profile &&
  'username' in profile &&
  'firstName' in profile &&
  !('loginService' in profile) &&
  !('loginIdentificator' in profile) &&
  !('dn' in profile) &&
  !('updatedAt' in profile) &&
  !('createdAt' in profile);

export const isProfile = (profile: unknown): profile is Profile =>
  typeof profile === 'object' &&
  profile !== null &&
  'id' in profile &&
  'username' in profile &&
  'firstName' in profile &&
  'loginService' in profile &&
  'loginIdentificator' in profile &&
  'dn' in profile &&
  'updatedAt' in profile &&
  'createdAt' in profile;
