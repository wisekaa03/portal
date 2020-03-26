/** @format */

// #region Import NPM
// import React from 'react';
import { WithTranslation } from 'next-i18next';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext } from 'next/document';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import { NormalizedCacheObject /* , IdGetterObj */ } from 'apollo-cache-inmemory';
import { Order, Connection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import { UserContext } from '@back/user/models/user.dto';
import { Profile } from '@back/profile/models/profile.dto';

export * from './app-bar';
export * from './auth';
export * from './dropzone';
export * from './files';
export * from './iframe';
export * from './profile';
export * from './services';
export * from './treeview';
// #endregion

interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface WithApolloState<TCache = NormalizedCacheObject> {
  data?: TCache;
}

export interface ApolloInitialProps<TCache = NormalizedCacheObject> extends AppInitialProps {
  apolloState: WithApolloState<TCache>;
  currentLanguage?: string;
}

export interface ApolloAppProps<TCache = NormalizedCacheObject> extends AppContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  apolloState: WithApolloState<TCache>;
  disableGeneration?: boolean;
  context: UserContext;
}

export interface ApolloDocumentProps extends DocumentContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  currentLanguage?: string;
}

export interface Data<K, T> {
  [K: string]: T;
}

export type ColumnNames =
  | 'lastName'
  | 'nameeng'
  | 'username'
  | 'thumbnailPhoto'
  | 'thumbnailPhoto40'
  | 'company'
  | 'companyeng'
  | 'department'
  | 'departmenteng'
  | 'otdel'
  | 'otdeleng'
  | 'title'
  | 'positioneng'
  | 'manager'
  | 'room'
  | 'telephone'
  | 'fax'
  | 'mobile'
  | 'workPhone'
  | 'email'
  | 'country'
  | 'region'
  | 'town'
  | 'street'
  | 'disabled'
  | 'notShowing';

export interface Column {
  name: ColumnNames;
  admin: boolean;
  defaultStyle: StyleProps;
  largeStyle: StyleProps;
}

export interface ProfileQueryProps {
  first: number;
  after: string;
  orderBy: Order<ColumnNames>;
  search: string;
  disabled: boolean;
  notShowing: boolean;
}

export interface PhonebookSearchProps {
  searchRef: React.MutableRefObject<HTMLInputElement>;
  search: string;
  suggestions: string[];
  refetch: (variables?: ProfileQueryProps) => Promise<ApolloQueryResult<Data<'profiles', Connection<Profile>>>>;
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
  columns: ColumnNames[];
  handleClose: () => void;
  handleReset: () => void;
  changeColumn(columns: ColumnNames[]): void;
  isAdmin: boolean;
}

export interface PhonebookHelpProps extends WithTranslation {
  onClose: () => void;
}

export interface HeaderPropsRef {
  style: any;
}

export interface HeaderProps {
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (column: ColumnNames) => () => void;
  largeWidth: boolean;
}

export interface TableProps {
  hasLoadMore: boolean;
  loadMoreItems: () => any;
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (_: ColumnNames) => () => void;
  largeWidth: boolean;
  // TODO: вписать нормальный тип
  data: any;
}

export interface PhonebookProfileControlProps {
  controlEl: HTMLElement | null;
  profileId: string;
  handleControl: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseControl: () => void;
}

export interface PhonebookProfileModule<T extends string | number | symbol> {
  profile: Profile;
  classes: Record<T, string>;
}

export interface PhonebookProfileNameProps extends PhonebookProfileModule<'root'> {
  type: 'firstName' | 'lastName' | 'middleName';
}

export interface PhonebookProfileFieldProps extends PhonebookProfileModule<'root' | 'pointer'> {
  last?: boolean;
  onClick?: (_: Profile | string | undefined) => () => void;
  title: string;
  field:
    | 'department'
    | 'company'
    | 'title'
    | 'otdel'
    | 'manager'
    | 'country'
    | 'region'
    | 'town'
    | 'street'
    | 'postalCode';
}

export interface HelpDataProps {
  id: number;
  image: any;
  text: React.ReactNode;
}
