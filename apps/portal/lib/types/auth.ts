/** @format */

import React from 'react';
import { MutationFunction } from '@apollo/client';

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
