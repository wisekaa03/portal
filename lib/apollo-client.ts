/** @format */

// #region Imports NPM
import fetch from 'isomorphic-fetch';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { concat, ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { HttpLink, createHttpLink } from 'apollo-link-http';
// import { WebSocketLink } from 'apollo-link-ws';
// #endregion
// #region Imports Local
import stateResolvers from './state-link';
// #endregion

let apollo: ApolloClient<NormalizedCacheObject>;

const create = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  const cache = new InMemoryCache();

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

  const errorLink = onError(({ graphQLErrors, networkError }): any => {
    if (graphQLErrors) {
      // TODO: реализовать https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error
      graphQLErrors.map(({ message, locations, path }): any =>
        console.error('[GraphQL error]: Path:', path, 'Message:', message, 'Location:', locations),
      );
    }
    if (networkError) {
      console.error('[Network error]:', networkError);
    }
  });

  let clientParams = {};
  if (__SERVER__) {
    global.fetch = fetch;

    httpLink = createHttpLink({
      uri: `http://localhost:${process.env.PORT}/graphql`,
    });
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

    httpLink = createHttpLink({
      uri: `/graphql`,
    });

    clientParams = {
      resolvers: stateResolvers,
    };
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__, // Disables forceFetch on the server (so queries are only run once)
    link: concat(authLink.concat(errorLink), httpLink),
    cache: cache.restore(initialState),
    ...clientParams,
  });
};

export const apolloClient = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  if (__SERVER__) {
    return create(initialState, cookie);
  }

  if (!apollo) {
    apollo = create(initialState);
  }

  return apollo;
};
