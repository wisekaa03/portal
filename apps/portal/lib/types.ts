/** @format */

// #region Import NPM
// import React from 'react';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext } from 'next/document';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject /* , IdGetterObj */ } from 'apollo-cache-inmemory';
import { Order } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import { UserContext } from '../src/user/models/user.dto';
import { ColumnNames } from '../components/phonebook/types';
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
  context: UserContext;
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

export interface ProfileQueryProps {
  first: number;
  after: string;
  orderBy: Order<ColumnNames>;
  search: string;
  disabled: boolean;
  notShowing: boolean;
}
