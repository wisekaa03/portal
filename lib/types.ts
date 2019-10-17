/** @format */

// #region Import NPM
import React from 'react';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext } from 'next/document';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject, IdGetterObj } from 'apollo-cache-inmemory';
// #endregion

export interface NodeIdGetterObj extends IdGetterObj {
  nodeId?: string;
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
  currentLanguage?: string;
  isMobile?: boolean;
}

export interface ApolloDocumentProps extends DocumentContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  currentLanguage?: string;
}

export interface Address {
  country: string;
  postalCode: string;
  region: string;
  street: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  middleName: string;
  birthday: string;
  gender: string;
  addressPersonal: Address;
  thumbnailPhoto: string;
  updatedAt: string;
  createdAt: string;
}

export interface User {
  token: string;
  id: string;
  username: string;
  updatedAt: string;
  createdAt: string;
  profile: Profile;
}

export interface ProfileParams {
  token?: string;
  user?: User;
  language?: string;
  isMobile?: boolean;
}

/**
 * Yes the user object is stored in Apollo state but we don't want to have to
 * use <Query query={FETCH_CURRENT_USER}></Query> plus render props for
 * EVERY component that needs access to it. So we only do that once here, near
 * the top, then put the user object in React Context for ease of access.
 */
export const ProfileContext = React.createContext<ProfileParams | undefined>(undefined);
