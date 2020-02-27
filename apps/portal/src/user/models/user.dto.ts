/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// import { IsNotEmpty } from 'class-validator';
// #endregion
// #region Imports Local
import { Profile } from '../../profile/models/profile.dto';
import { Group } from '../../group/models/group.dto';
import { ColumnNames } from '../../../components/phonebook/types';
import { GroupEntity } from '../../group/group.entity';
// #endregion

export interface BaseUser {
  id?: string;

  username: string;

  password?: string;

  disabled: boolean;

  groups?: Group[] | GroupEntity[];

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

// #region Email Session Props
export interface MailSessionProps {
  error?: string;
  sessid?: string;
  sessauth?: string;
}
// #endregion
