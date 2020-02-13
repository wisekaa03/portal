/** @format */

// #region Imports NPM
import React from 'react';
import { getDataFromTree } from '@apollo/react-ssr';
import { getMarkupFromTree } from 'react-apollo-hooks';
import { renderToString } from 'react-dom/server';
import Head from 'next/head';
import { AppContext } from 'next/app';
import Router from 'next/router';
import { ApolloClient } from 'apollo-client';
import { concat, ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-fetch';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { InStorageCache } from 'apollo-cache-instorage';
import { PersistentStorage, PersistedData } from 'apollo-cache-persist/types';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { isMobile as checkMobile } from 'is-mobile';
// #endregion
// #region Imports Local
import { nextI18next } from './i18n-client';
import stateResolvers from './state-link';
import getRedirect from './get-redirect';
import { ApolloAppProps, ApolloInitialProps } from './types';
// #endregion

interface CreateClientProps {
  initialState?: any;
  cookie?: string;
}

let browserApolloClient: ApolloClient<NormalizedCacheObject>;

const createClient = ({ initialState, cookie }: CreateClientProps): ApolloClient<NormalizedCacheObject> => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Cookie: cookie,
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError /* , response, operation */ }): any => {
    if (graphQLErrors) {
      // TODO: реализовать https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error
      graphQLErrors.forEach(({ message, locations, path, extensions }): void => {
        console.error('[GraphQL error]: Path:', path, 'Message:', message, 'Location:', locations);

        if (!__SERVER__) {
          if (
            extensions.code === 'UNAUTHENTICATED' ||
            extensions.exception!.status === 403 ||
            extensions.exception!.status === 401
          ) {
            Router.push({ pathname: '/auth/login', query: { redirect: getRedirect(window.location.pathname) } });
          }
        }
      });
    }
    if (networkError) {
      console.error('[Network error]:', networkError);
    }
  });

  let clientParams = {};
  let httpLink: ApolloLink;
  let cache: InMemoryCache;

  if (__SERVER__) {
    global.fetch = fetch;

    httpLink = createHttpLink({
      uri: `http://localhost:${process.env.PORT}/graphql`,
    });

    cache = new InMemoryCache().restore(initialState);
  } else {
    httpLink = createUploadLink({
      uri: `/graphql`,
    });

    clientParams = {
      resolvers: stateResolvers,
    };

    // TODO: лучшенный контроль за кешем (продумать)
    // TODO: Протестить без него
    cache = new InStorageCache({
      storage: window.sessionStorage as PersistentStorage<PersistedData<NormalizedCacheObject>>,
      // shouldPersist: (operation: string, dataId: string, value?: object): boolean => {
      //   // debugger;
      //   return true;
      // },
      // denormalize: (value: any): any => {
      //   // debugger;

      //   try {
      //     return JSON.parse(value);
      //   } catch {
      //     return value;
      //   }
      // },
    }).restore(initialState) as InMemoryCache;
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__,
    link: concat(authLink.concat(errorLink), httpLink),
    cache,
    ...clientParams,
  });
};

const initApollo = (options: CreateClientProps): ApolloClient<NormalizedCacheObject> => {
  if (__SERVER__) {
    return createClient(options);
  }

  if (!browserApolloClient) {
    browserApolloClient = createClient(options);
  }

  return browserApolloClient;
};

export const withApolloClient = (MainApp: any /* typeof NextApp */): Function =>
  class Apollo extends React.Component<ApolloAppProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    // eslint-disable-next-line react/static-property-placement
    static displayName = 'withApolloClient(MainApp)';

    public static async getInitialProps(appCtx: AppContext): Promise<ApolloInitialProps> {
      const { AppTree, Component, router, ctx } = appCtx;
      // const apolloState: WithApolloState = {};
      const apolloClient = initApollo({ cookie: ctx?.req?.headers?.cookie });

      const currentLanguage = (ctx.req && lngFromReq(ctx.req)) || nextI18next.i18n.language;
      const isMobile = ctx.req ? checkMobile({ ua: ctx.req.headers['user-agent'] }) : false;

      const appProps = MainApp.getInitialProps ? await MainApp.getInitialProps(appCtx) : { pageProps: {} };

      if (__SERVER__) {
        try {
          await getDataFromTree(
            <AppTree
              {...appProps}
              // {...appCtx}
              Component={Component}
              router={router}
              // apolloState={apolloState}
              apolloClient={apolloClient}
              currentLanguage={currentLanguage}
              isMobile={isMobile}
            />,
          );

          // TODO: что это такое ?
          // await getMarkupFromTree({
          //   renderFunction: renderToString,
          //   tree: (
          //     <AppTree
          //       {...appProps}
          //       // {...appCtx}
          //       Component={Component}
          //       router={router}
          //       // apolloState={apolloState}
          //       apolloClient={apolloClient}
          //       currentLanguage={currentLanguage}
          //       isMobile={isMobile}
          //     />
          //   ),
          // });
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          if (!(error && error.status === 401)) {
            console.error('withApolloClient getDataFromTree:', error);
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      // Extract query data from the Apollo store
      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      return {
        ...appProps,
        currentLanguage,
        isMobile,
        apolloState,
      };
    }

    public constructor(props: any) {
      super(props);
      this.apolloClient = initApollo({ initialState: props.apolloState });
    }

    public render(): React.ReactElement {
      return <MainApp apolloClient={this.apolloClient} {...this.props} />;
    }
  };
