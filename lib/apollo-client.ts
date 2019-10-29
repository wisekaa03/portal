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
import { NodeIdGetterObj } from './types';
import stateResolvers from './state-link';
import { getStorage } from './session-storage';
import { SESSION } from './constants';
// #endregion

let apollo: ApolloClient<NormalizedCacheObject>;

export const apolloClient = (
  initialState = {},
  _linkOptions: HttpLink.Options = {},
): ApolloClient<NormalizedCacheObject> => {
  if (apollo) {
    return apollo;
  }

  const cache = new InMemoryCache({
    dataIdFromObject: (object: NodeIdGetterObj) => object.nodeId || null,
  }).restore(initialState);

  // Create an http link:
  let httpLink: ApolloLink;

  const authLink = setContext((_, { headers }) => {
    // const token = getStorage(SESSION);

    return {
      headers: {
        ...headers,
        // authorization: token ? `Bearer ${token}` : '',
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
      uri: `http://${process.env.HOST}:${process.env.PORT}/graphql`,
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

    cache.writeData({
      data: {
        isLoggedIn: !!getStorage(SESSION),
      },
    });

    clientParams = {
      resolvers: stateResolvers,
      // typeDefs: gql`
      //   type isLoggedIn {
      //     isLoggedIn: Boolean
      //   }
      // `,
    };
  }

  if (!apollo) {
    apollo = new ApolloClient({
      connectToDevTools: !__SERVER__,
      ssrMode: __SERVER__,
      link: concat(authLink.concat(errorLink), httpLink),
      cache,
      ...clientParams,
    });
  }

  return apollo;
};
