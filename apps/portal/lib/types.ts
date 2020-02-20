/** @format */

// #region Import NPM
// import React from 'react';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext } from 'next/document';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject /* , IdGetterObj */ } from 'apollo-cache-inmemory';
// #endregion
// #region Imports Local
import { Profile } from '../src/profile/models/profile.dto';
// #endregion

// export interface GqlErrorMessage {
//   statusCode: number;
//   error: string;
//   message: string;
// }

// export interface NodeIdGetterObj extends IdGetterObj {
//   nodeId?: string;
// }

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
  currentLanguage?: string;
  isMobile?: boolean;
}

export interface ApolloDocumentProps extends DocumentContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  currentLanguage?: string;
}

// export interface Address {
//   country: string;
//   postalCode: string;
//   town: string;
//   region: string;
//   street: string;
// }

export interface Data<K, T> {
  [K: string]: T;
}

export interface ProfileProps extends Profile {
  pageInfo: any;
  edges: any;
  totalCount: any;
}
