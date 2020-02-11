/** @format */

// #region Imports NPM
import fetch from 'isomorphic-fetch';
import { ApolloClient } from 'apollo-client';
import { InStorageCache } from 'apollo-cache-instorage';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { PersistentStorage, PersistedData } from 'apollo-cache-persist/types';
import { concat, ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import { createUploadLink } from 'apollo-upload-client';
import Router from 'next/router';
// import { WebSocketLink } from 'apollo-link-ws';
// #endregion
// #region Imports Local
import stateResolvers from './state-link';
import getRedirect from './get-redirect';
import { GqlErrorMessage } from './types';
// #endregion

let apollo: ApolloClient<NormalizedCacheObject>;

const create = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  // Create an http link:
  let httpLink: ApolloLink;

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Cookie: cookie,
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, response, operation }): any => {
    if (graphQLErrors) {
      // TODO: реализовать https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error
      graphQLErrors.forEach(({ message, locations, path, extensions }): void => {
        if (!__SERVER__) {
          switch (extensions.code) {
            case 'UNAUTHENTICATED':
              Router.push({ pathname: '/auth/login', query: { redirect: getRedirect(window.location.pathname) } });
              return;

            case 'INTERNAL_SERVER_ERROR':
            default:
            // if (process.env.NODE_ENV === 'production') {
            //   Router.push({ pathname: '/auth/login', query: { redirect: getRedirect(window.location.pathname) } });
            // }
          }
        }
        console.error('[GraphQL error]: Path:', path, 'Message:', message, 'Location:', locations);
      });
    }
    if (networkError) {
      console.error('[Network error]:', networkError);
    }
  });

  let clientParams = {};
  let cache: InMemoryCache;

  if (__SERVER__) {
    global.fetch = fetch;

    httpLink = createHttpLink({
      uri: `http://localhost:${process.env.PORT}/graphql`,
    });

    cache = new InMemoryCache().restore(initialState);
  } else {
    // const subscriptionsUri = `${window.location.origin.replace(
    //   'http',
    //   'ws',
    // )}/graphql`; // __WEBSOCKET_URI__
    // Create a WebSocket link:
    // const wsLink = new WebSocketLink({
    //   uri: subscriptionsUri,
    //   options: {
    //     reconnect: true,
    //     // connectionParams: async () => {
    //     //   return { token: localStorage.getItem(SESSION) };
    //     // },
    //     connectionCallback: (errors: Error[], _result: any): any => {
    //       if (errors) {
    //         console.error('[Error in webSocket]:', errors);
    //       }
    //     },
    //   },
    // });

    // httpLink = createHttpLink({
    //   uri: `/graphql`,
    // });

    httpLink = createUploadLink({
      uri: `/graphql`,
    });

    clientParams = {
      resolvers: stateResolvers,
    };

    // TODO: лучшенный контроль за кешем (продумать)
    cache = new InStorageCache({
      storage: window.sessionStorage as PersistentStorage<PersistedData<NormalizedCacheObject>>,
      shouldPersist: (operation: string, dataId: string, value?: object): boolean => {
        // debugger;
        return true;
      },
      denormalize: (value: any): any => {
        // debugger;

        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
    }).restore(initialState) as InMemoryCache;
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__, // Disables forceFetch on the server (so queries are only run once)
    link: concat(authLink.concat(errorLink), httpLink),
    cache,
    ...clientParams,
  });
};

export const apolloClient = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  if (__SERVER__) {
    return create(initialState, cookie);
  }

  if (!apollo) {
    apollo = create(initialState, cookie);
  }

  return apollo;
};
