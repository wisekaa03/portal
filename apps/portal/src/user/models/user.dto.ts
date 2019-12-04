/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// import { IsNotEmpty } from 'class-validator';
// #endregion
// #region Imports Local
import { Profile } from '../../profile/models/profile.dto';
import { Group } from '../../group/models/group.dto';
// #endregion

export interface BaseUser {
  id?: string;

  username: string;

  password?: string;

  disabled: boolean;

  groups?: Group[];

  isAdmin: boolean;

  settings: UserSettings;

  createdAt?: Date;

  updatedAt?: Date;
}

// #region User
export interface User extends BaseUser {
  profile: Profile;
}
// #endregion

export interface UserToSave extends BaseUser {
  profile: Profile | string;
}

// #region User login
export interface UserLogin {
  // @IsNotEmpty()
  username: string;

  // @IsNotEmpty()
  password: string;
}
// #endregion

// #region User register
export interface UserRegister {
  username: string;

  password: string;

  isAdmin: boolean;
}
// #endregion

// #region User settings
export interface UserSettings {
  lng?: 'ru' | 'en' | null;
  drawer?: boolean | null;
}
// #endregion

// #region User context
export interface UserContext {
  user?: User;
  language?: string;
  isMobile?: boolean;
}
// #endregion

// #region Email Session Props
export interface EmailSessionProps {
  error?: string;
  sessid?: string;
  sessauth?: string;
}
// #endregion
