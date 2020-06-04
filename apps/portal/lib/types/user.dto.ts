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

export interface UserSettingsTaskFavorite extends Omit<TkRoute, 'name' | 'services'> {
  name?: string;
  priority?: number;
  service?: UserSettingsTaskFavoriteService;
}

interface UserSettingsTask {
  status?: string | null;
  favorites?: UserSettingsTaskFavorite[];
}

export interface UserSettings {
  lng?: 'ru' | 'en' | null;
  drawer?: boolean | null;
  phonebook?: UserSettingsPhonebook | null;
  task?: UserSettingsTask | null;
}
//#endregion

//#region User context
export interface UserContext {
  user?: User;
  language?: string;
  isMobile?: boolean;
}
//#endregion
