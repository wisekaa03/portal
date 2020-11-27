/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import type { Profile } from './profile.dto';
import type { Group } from './group.dto';
import type { PhonebookColumnNames, PhonebookFilter } from './profile';
import type { LoginService } from './login-service';
import type { TkService, TkRoute, TkWhere } from './tickets';
//#endregion

export enum Contact {
  PROFILE = 'PROFILE',
  USER = 'USER',
  GROUP = 'GROUP',
}

export interface AllUsersInfo {
  domain: string | null;
  id: string | null;
  loginIdentificator: string | null;
  name: string | null;
  contact?: Contact | null;
}

//#region User settings
export interface UserSettingsPhonebook {
  columns?: PhonebookColumnNames[];
  filters?: PhonebookFilter[];
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
  lng?: string; // 'ru' | 'en' | ...
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
  'filters',
];
//#endregion

export interface BaseUser {
  id?: string;

  loginService?: LoginService;
  loginDomain?: string | null;
  loginIdentificator?: string | null;

  username: string;

  password?: string | null;

  disabled?: boolean | null;

  groups?: Group[] | null;

  groupIds?: string[] | null;

  isAdmin?: boolean | null;

  settings?: UserSettings | null;

  createdAt?: Date | null;

  updatedAt?: Date | null;

  __typename?: 'User';
}

//#region User
export interface User extends BaseUser {
  profile: Profile;
  profileId: string;
}

declare module 'express' {
  export interface Request {
    user: User;
  }
}

export interface MailSession {
  sessid: string;
  sessauth: string;
}

declare module 'express-session' {
  interface SessionData {
    passport: UserContext;
    password: string;
    mailSession: MailSession;
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
