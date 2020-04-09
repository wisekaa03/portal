/** @format */

import { MutationFunction } from 'react-apollo';
import { User } from './user.dto';

export interface LoginPageProps {
  initUsername: string;
  namespacesRequired: string[];
}

export interface LogoutPageProps {
  loading: boolean;
  logout: MutationFunction<boolean>;
}

export interface LoginComponentProps {
  usernameRef: React.Ref<HTMLInputElement>;
  passwordRef: React.Ref<HTMLInputElement>;
  values: LoginValuesProps;
  loading: boolean;
  handleValues: (_: keyof LoginValuesProps) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleKeyDown: (_: React.KeyboardEvent) => void;
}

export interface LoginValuesProps {
  save: boolean;
  username: string;
  password: string;
}

// #region Email Session Props
export interface MailSession {
  error?: string;
  sessid?: string;
  sessauth?: string;
}
// #endregion

// #region User response
export interface UserSession {
  user: User;
  mailSession?: MailSession;
  passwordFrontend?: string;
}
// #endregion
