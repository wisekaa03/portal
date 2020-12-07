/** @format */

import React from 'react';
import { MutationFunction } from '@apollo/client';
import { User } from './user.dto';

export interface LoginPageProps {
  initUsername: string;
  initDomain: string;
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
  handleValues: (values: keyof LoginValuesProps) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDomain: (value?: string) => void;
  handleSubmit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface LoginValuesProps {
  save: boolean;
  username: string;
  password: string;
  domain: string;
}

//#region Email session
export interface EmailSession {
  error?: string;
  sessid?: string;
  sessauth?: string;
}
//#endregion

//#region Login email
export interface LoginEmail {
  login: boolean;
  error?: string;
}
//#endregion

//#region Login response
export interface Login {
  user: User;
  email: LoginEmail;
}
//#endregion

export interface AvailableAuthenticationProfiles {
  domain: string;
}
