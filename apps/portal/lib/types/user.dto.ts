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
  PROFILE,
  USER,
  GROUP,
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
  columns?: ColumnNames[] | null;
}

export interface UserSettingsTaskFavoriteService extends Omit<TkService, 'where' | 'name'> {
  where?: TkWhere;
  name?: string;
}

export interface UserSettingsTaskFavoriteRoute extends Omit<TkRoute, 'where' | 'name'> {
  where?: TkWhere;
  name?: string;
}

export interface UserSettingsTaskFavorite extends Omit<TkRoute, 'name' | 'services'> {
  name?: string;
  priority?: number;
  route?: UserSettingsTaskFavoriteRoute;
  service?: UserSettingsTaskFavoriteService;
}

interface UserSettingsTask {
  status?: string | null;
  favorites?: UserSettingsTaskFavorite[];
}

export interface UserSettings {
  lng?: 'ru' | 'en' | null;
  fontSize?: number | null;
  drawer?: boolean | null;
  phonebook?: UserSettingsPhonebook | null;
  task?: UserSettingsTask | null;
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

export interface UserProfileLDAP
  extends Omit<Profile, 'loginService' | 'loginIdentificator' | 'dn' | 'updatedAt' | 'createdAt'>,
    Omit<BaseUser, 'loginService' | 'loginIdentificator' | 'settings' | 'isAdmin' | 'updatedAt' | 'createdAt'> {
  contact: Contact;
}
