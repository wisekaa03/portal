/** @format */

//#region Imports NPM
import type React from 'react';
import type { WithTranslation } from 'next-i18next';
import type { ApolloQueryResult } from '@apollo/client';
import type { Order, Connection } from 'typeorm-graphql-pagination';
import type { OutlinedInputProps } from '@material-ui/core';
// import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/Autocomplete';
//#endregion
//#region Imports Local
import { UserSettingsPhonebookFilterInput } from '@back/user/graphql/UserSettingsPhonebookFilter.input';
import type { Profile } from '@back/profile/profile.entity';
import { ProfileInput } from '@back/profile/graphql/ProfileInput.input';
import { SearchSuggestions } from '@back/profile/graphql/SearchSuggestions';
import { PhonebookColumnNames } from '@back/profile/graphql/PhonebookColumnNames';

import type { StyleProps as StyleProperties, Data } from './common';
//#endregion

export type PROFILE_TYPE = Partial<Omit<Profile, 'resizeImage' | 'setComputed' | 'managerId' | 'manager'>> & {
  manager?: PROFILE_TYPE;
};

export const ProfileAutocompleteFields: Pick<
  PROFILE_TYPE,
  'loginDomain' | 'company' | 'management' | 'department' | 'division' | 'country' | 'region' | 'city' | 'street' | 'postalCode' | 'manager'
> = {
  loginDomain: undefined,
  company: undefined,
  management: undefined,
  department: undefined,
  division: undefined,
  country: undefined,
  region: undefined,
  city: undefined,
  street: undefined,
  postalCode: undefined,
  manager: undefined,
};

export const isProfileInput = (profile: unknown): profile is ProfileInput =>
  typeof profile === 'object' &&
  profile !== null &&
  'id' in profile &&
  'username' in profile &&
  'firstName' in profile &&
  !('loginService' in profile) &&
  !('loginDN' in profile) &&
  !('updatedAt' in profile) &&
  !('createdAt' in profile);

export const isProfile = (profile: unknown): profile is PROFILE_TYPE =>
  typeof profile === 'object' &&
  profile !== null &&
  'id' in profile &&
  'username' in profile &&
  'firstName' in profile &&
  'loginService' in profile &&
  'loginDN' in profile &&
  'updatedAt' in profile &&
  'createdAt' in profile;

export interface PhonebookColumn {
  name: PhonebookColumnNames;
  admin: boolean;
  defaultStyle: StyleProperties;
  largeStyle: StyleProperties;
}

export interface ProfileQueryProps {
  first: number;
  after: string;
  orderBy: Order<PhonebookColumnNames>;
  search: string;
  disabled: boolean;
  notShowing: boolean;
  filters?: UserSettingsPhonebookFilterInput[];
}

export interface PhonebookSearchProps {
  search: string;
  suggestions: SearchSuggestions[];
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  handleSugClose: (_: React.MouseEvent<EventTarget>) => void;
  handleSugKeyDown: (_: React.KeyboardEvent) => void;
  handleSugClick: (_: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  handleHelpOpen: () => void;
  handleSettingsOpen: () => void;
}

export interface ProfileProps extends WithTranslation {
  profileId: string;
  handleClose(): void;
  handleSearch(text: string): void;
}

export interface SettingsProps extends WithTranslation {
  columns: PhonebookColumnNames[];
  filters: UserSettingsPhonebookFilterInput[];
  handleClose: () => void;
  handleReset: () => void;
  changeColumn: (columnsVal: PhonebookColumnNames[], filtersVal: UserSettingsPhonebookFilterInput[]) => void;
  handleFilters: (value?: unknown) => void;
  isAdmin: boolean;
}

export interface PhonebookHelpProps extends WithTranslation {
  onClose: () => void;
}

export interface HeaderPropsRef {
  style: React.CSSProperties;
}

export interface PhonebookHeaderContextProps {
  columns: PhonebookColumnNames[];
  orderBy: Order<PhonebookColumnNames>;
  handleSort: (column: PhonebookColumnNames) => () => void;
  largeWidth: boolean;
}

export interface PhonebookTableProps {
  hasLoadMore: boolean;
  loadMoreItems: () => Promise<undefined | ApolloQueryResult<Data<'profiles', Connection<PROFILE_TYPE>>>>;
  columns: PhonebookColumnNames[];
  orderBy: Order<PhonebookColumnNames>;
  handleSort: (_: PhonebookColumnNames) => () => void;
  largeWidth: boolean;
  data: Connection<PROFILE_TYPE>;
}

export interface PhonebookProfileControlProps {
  controlEl: HTMLElement | null;
  profileId?: string;
  handleControl: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseControl: () => void;
}

export interface PhonebookProfileModule<T extends string | number | symbol> {
  profile?: PROFILE_TYPE;
  classes: Record<T, string>;
}

export interface PhonebookProfileNameProps extends PhonebookProfileModule<'root'> {
  type: 'firstName' | 'lastName' | 'middleName';
}

export interface PhonebookProfileFieldProps extends PhonebookProfileModule<'root' | 'pointer'> {
  last?: boolean;
  onClick?: (profile: PhonebookColumnNames) => () => void;
  title: string;
  field: PhonebookColumnNames;
}

export interface HelpDataProps {
  id: number;
  image: unknown;
  text: React.ReactNode;
}

export interface ProfileEditComponentProps {
  isAdmin: boolean;
  newProfile?: boolean;
  loadingCheckUsername?: boolean;
  loadingProfile: boolean;
  loadingChanged: boolean;
  hasUpdate: boolean;
  profile?: PROFILE_TYPE;
  language?: string;
  onDrop: (_: File[]) => Promise<void>;
  handleCheckUsername?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleChange: (
    field: PhonebookColumnNames,
  ) => (
    event: React.SyntheticEvent<Element, Event>,
    value: unknown,
    reason?: any /* AutocompleteChangeReason, */,
    details?: any /* AutocompleteChangeDetails<unknown> | undefined, */,
  ) => void;
  handleBirthday: (date?: Date | null) => void;
  handleSave: () => void;
}

export interface TextFieldComponentProps {
  disabled: boolean;
  handleChange?: (
    field: PhonebookColumnNames,
  ) => (
    event: React.SyntheticEvent<Element, Event>,
    value: unknown,
    reason?: any /* AutocompleteChangeReason, */,
    details?: any /* AutocompleteChangeDetails<unknown> | undefined, */,
  ) => void;
  field: PhonebookColumnNames;
  value?: unknown;
  InputProps: Partial<OutlinedInputProps>;
  fullWidth?: boolean;
}

export interface DomainComponentProps {
  disabled?: boolean;
  newProfile?: boolean;
  handleDomain?: (value: string) => void;
  domain?: unknown;
  InputProps?: Partial<OutlinedInputProps>;
  fullWidth?: boolean;
}
