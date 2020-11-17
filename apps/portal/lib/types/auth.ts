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
  domainRef: React.Ref<HTMLInputElement>;
  values: LoginValuesProps;
  loading: boolean;
  handleValues: (_: keyof LoginValuesProps) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  handleDomain: (
    __: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) => void;
  handleSubmit: (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleKeyDown: (_: React.KeyboardEvent<HTMLDivElement>) => void;
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
