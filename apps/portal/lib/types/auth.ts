/** @format */

import React from 'react';
import { MutationFunction, QueryLazyOptions } from '@apollo/client';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/Autocomplete';
import { User } from './user.dto';
import { Data } from './common';

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
  handleValues: (_: keyof LoginValuesProps) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  getDomain: (options?: QueryLazyOptions<Record<string, any>> | undefined) => void;
  loadingDomain: boolean;
  dataDomain?: Data<'availableAuthenticationProfiles', string[]>;
  handleDomain: (
    event: React.ChangeEvent<Record<string, unknown>>,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown>,
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
