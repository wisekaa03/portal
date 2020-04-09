/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { ColumnNames } from './profile';
import { LoginService } from './login-service';
import { Profile } from './profile.dto';
import { Group } from './group.dto';
// #endregion

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

// #region User
export interface User extends BaseUser {
  profile: Profile;
  profileId?: string;
}
// #endregion

export interface UserToSave extends BaseUser {
  profile: Profile | string;
}

// #region User settings
interface UserSettingsTicket {
  status?: string | null;
}

interface UserSettingsPhonebook {
  columns?: ColumnNames[] | null;
}

export interface UserSettings {
  lng?: 'ru' | 'en' | null;
  drawer?: boolean | null;
  ticket?: UserSettingsTicket | null;
  phonebook?: UserSettingsPhonebook | null;
}
// #endregion

// #region User context
export interface UserContext {
  user?: User;
  language?: string;
  isMobile?: boolean;
}
// #endregion
