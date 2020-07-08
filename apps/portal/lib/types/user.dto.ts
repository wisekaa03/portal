/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { ColumnNames } from './profile';
import { LoginService } from './login-service';
import { Profile } from './profile.dto';
import { Group } from './group.dto';
import { TkService, TkRoute, TkWhere } from './tickets';
//#endregion

export enum Contact {
  PROFILE = 'PROFILE',
  USER = 'USER',
  GROUP = 'GROUP',
}

export interface AllUsersInfo {
  contact?: Contact;
  id?: string;
  loginIdentificator?: string;
  name?: string;
}

export interface BaseUser {
  id?: string;

  loginService: LoginService;
  loginIdentificator: string;

  username: string;

  password?: string;

  disabled: boolean;

  groups?: Group[];

  groupIds?: string[];

  isAdmin: boolean;

  settings: UserSettings;

  createdAt?: Date;

  updatedAt?: Date;
}

//#region User
export interface User extends BaseUser {
  profile: Profile;
  profileId?: string;
}
//#endregion

export interface UserToSave extends BaseUser {
  profile: Profile | string;
}

//#region User settings
export interface UserSettingsPhonebook {
  columns?: ColumnNames[];
}

export interface UserSettingsTaskFavorite {
  where: string;
  code: string;
  svcCode: string;
}
export interface UserSettingsTaskFavoriteFull {
  route: TkRoute;
  service: TkService;
}

interface UserSettingsTask {
  status?: string;
  favorites?: UserSettingsTaskFavorite[];
}

export interface UserSettings {
  lng?: 'ru' | 'en';
  fontSize?: number;
  drawer?: boolean;
  phonebook?: UserSettingsPhonebook;
  task?: UserSettingsTask;
}

export const DefinedUserSettings = [
  'lng',
  'fontSize',
  'drawer',
  'phonebook',
  'task',
  'status',
  'favorites',
  'name',
  'priority',
  'route',
  'service',
  'where',
  'columns',
];
//#endregion

//#region User context
export interface UserContext {
  user?: User;
  fontSize?: number;
  language?: string;
  isMobile?: boolean;
}
//#endregion
