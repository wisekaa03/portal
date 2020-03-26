/** @format */

// #region Import NPM
// import React from 'react';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext } from 'next/document';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject /* , IdGetterObj */ } from 'apollo-cache-inmemory';
// #endregion
// #region Imports Local
import { UserContext } from './user.dto';

export * from './app-bar';
export * from './auth';
export * from './common';
export * from './dropzone';
export * from './file-upload-buffer';
export * from './files.dto';
export * from './files.folder.dto';
export * from './files';
export * from './gender';
export * from './group.dto';
export * from './iframe';
export * from './login-service';
export * from './news.dto';
export * from './old-service';
export * from './profile.dto';
export * from './profile';
export * from './services';
export * from './treeview';
export * from './user.dto';
// #endregion

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
