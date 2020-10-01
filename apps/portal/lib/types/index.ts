/** @format */

//#region Import NPM
// import React from 'react';
import { AppContext, AppInitialProps } from 'next/app';
import { DocumentContext, DocumentInitialProps } from 'next/document';
// import { GraphQLSchema } from 'graphql/type/schema';
import { ApolloClient } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
//#endregion
//#region Imports Local
import { UserContext } from './user.dto';

export * from './app-bar';
export * from './auth';
export * from './common';
export * from './dropzone';
export * from './docflow';
export * from './file-upload-buffer';
export * from './files.interface';
export * from './files';
export * from './gender';
export * from './group.dto';
export * from './iframe';
export * from './login-service';
export * from './news.dto';
export * from './tasks';
export * from './tickets';
export * from './profile.dto';
export * from './profile';
export * from './services';
export * from './treeview';
export * from './user.dto';
//#endregion

export interface AppInitialPropsMy<TCache = NormalizedCacheObject> extends AppInitialProps {
  initialLanguage?: string;
  language?: string;
  context?: UserContext;
  apollo?: NormalizedCacheObject;
}

export interface AppContextMy<TCache = NormalizedCacheObject> extends AppContext {
  disableGeneration?: boolean;
  context: UserContext;
  apollo: NormalizedCacheObject;
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

export interface DocumentContextMy extends DocumentContext {
  language?: string;
  nonce?: string;
}

export interface DocumentInitialPropsMy extends DocumentInitialProps {
  language?: string;
  nonce?: string;
}
