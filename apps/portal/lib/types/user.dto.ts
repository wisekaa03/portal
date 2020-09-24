/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import type { Profile } from './profile.dto';
import type { Group } from './group.dto';
import type { PhonebookColumnNames } from './profile';
import type { LoginService } from './login-service';
import type { TkService, TkRoute, TkWhere } from './tickets';
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

//#region User settings
export interface UserSettingsPhonebook {
  columns?: PhonebookColumnNames[];
  __typename?: 'UserSettingsPhonebook';
}

export interface UserSettingsTaskFavorite {
  where: TkWhere;
  code: string;
  svcCode: string;
  __typename?: 'UserSettingsTaskFavorite';
}
export interface UserSettingsTaskFavoriteFull {
  route: TkRoute;
  service: TkService;
}

interface UserSettingsTask {
  status?: string;
  favorites?: UserSettingsTaskFavorite[];
  __typename?: 'UserSettingsTask';
}

export interface UserSettings {
  lng?: 'ru' | 'en';
  fontSize?: number;
  drawer?: boolean;
  phonebook?: UserSettingsPhonebook;
  task?: UserSettingsTask;
  __typename?: 'UserSettings';
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

  __typename?: 'User';
}

//#region User
export interface User extends BaseUser {
  profile: Profile;
  profileId?: string;
}

declare module 'express' {
  export interface Request {
    user: User;
  }
}
//#endregion

export interface UserToSave extends BaseUser {
  profile: Profile | string;
}

//#region User context
export interface UserContext {
  user?: User;
  fontSize?: number;
  language?: string;
  isMobile?: boolean;
}
//#endregion
