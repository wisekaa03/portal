/** @format */

//#region Imports NPM
import { ApolloClient, from, split, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
// import { SchemaLink } from '@apollo/client/link/schema';
import { createUploadLink } from 'apollo-upload-client';
import { Logger } from 'winston';
import { OperationDefinitionNode } from 'graphql';
import Router from 'next/router';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
// import { resolvers } from './state-link';
import getRedirect from './get-redirect';
import { AUTH_PAGE } from './constants';
//#endregion

export class GlobalVars {
  static configService: ConfigService | undefined;
  static logger: Logger | typeof console = console;
  static browserApolloClient?: ApolloClient<NormalizedCacheObject>;
}

interface CreateClientProps {
  initialState?: NormalizedCacheObject;
  cookie?: string;
}

const createClient = ({ initialState, cookie }: CreateClientProps): ApolloClient<NormalizedCacheObject> | undefined => {
  const authMiddleware = new ApolloLink((operation, forward) => {
    if (cookie) {
      operation.setContext({
        headers: {
          cookie,
          // Authorization: `Bearer`,
        },
      });
    }

    return forward(operation);
  });

  if (__SERVER__) {
    /**
     *
     * @description: The Apollo Client on server
     *
     **/

    const errorMiddleware = onError(({ graphQLErrors, networkError, operation /* , response */ }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions /* , path, locations, originalError */ }) => {
          const definition = operation.query.definitions[0] as OperationDefinitionNode;
          if (message !== 'Unauthorized') {
            GlobalVars.logger.error({
              message: `Error: "${message}". ${definition?.kind === 'OperationDefinition' ? definition?.operation : ''} ${
                operation.operationName
              }`,
              error: extensions,
              // stack: extensions?.exception?.stacktrace,
              statusCode: extensions?.exception?.response?.statusCode,
              context: 'GraphQL backend',
              function: 'errorMiddleware',
            });
          }
        });
      }
      if (networkError) {
        GlobalVars.logger.error({
          message: `NetworkError: ${networkError.toString()}`,
          error: networkError,
          context: 'GraphQL backend',
          function: 'errorMiddleware',
        });
      }
    });

    // if (configService?.schema) {
    //   link = new SchemaLink({ schema: configService?.schema });
    // } else {
    // eslint-disable-next-line global-require
    global.fetch = require('node-fetch');

    let fetchOptions: Record<string, unknown> | undefined;
    if (GlobalVars.configService?.secure) {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const https = require('https');

      fetchOptions = {
        agent: new https.Agent({ rejectUnauthorized: false }),
      };
    }

    const PORT = GlobalVars.configService?.get<number>('PORT') || 4000;
    const link = new HttpLink({
      uri: `${GlobalVars.configService?.secure ? 'https:' : 'http:'}//localhost:${PORT}/graphql`,
      credentials: 'same-origin',
      fetchOptions,
    });
    // }

    const cache = new InMemoryCache().restore(initialState || {});

    return new ApolloClient({
      connectToDevTools: false,
      ssrMode: true,
      link: from([errorMiddleware, authMiddleware, link]),
      cache,
      // resolvers,
    });
  }

  /**
   *
   * @description: The Apollo Client on browser
   *
   **/

  const errorMiddleware = onError(({ graphQLErrors, networkError, operation /* , response */ }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions /* , locations, path, originalError */ }) => {
        const definition = operation.query.definitions[0] as OperationDefinitionNode;
        if (message !== 'Unauthorized') {
          GlobalVars.logger.error({
            message: `Error: "${message}". ${definition?.kind === 'OperationDefinition' ? definition?.operation : ''} ${
              operation.operationName
            }`,
            error: extensions,
            // stack: extensions?.exception?.stacktrace,
            statusCode: extensions?.exception?.response?.statusCode,
            context: 'GraphQL frontend',
            function: 'errorMiddleware',
          });
        } else {
          Router.push({ pathname: AUTH_PAGE, query: { redirect: getRedirect(window.location.pathname) } });
        }
      });
    }
    if (networkError) {
      GlobalVars.logger.error({
        message: `NetworkError: ${networkError.toString()}`,
        error: networkError,
        context: 'GraphQL frontend',
        function: 'errorMiddleware',
      });
    }
  });

  const httpLink = createUploadLink({
    uri: '/graphql',
    credentials: 'same-origin',
  });
  const wsLink = new WebSocketLink({
    uri: `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/graphql`,
    options: {
      reconnect: true,
    },
  });

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    (httpLink as unknown) as ApolloLink,
  );

  const cache = new InMemoryCache(
    !__SERVER__
      ? {
          typePolicies: {
            Query: {
              fields: {
                profiles: relayStylePagination(),
              },
            },
          },
        }
      : undefined,
  ).restore(initialState || {});

  return new ApolloClient({
    connectToDevTools: true,
    ssrMode: false,
    link: from([errorMiddleware, authMiddleware, link]),
    cache,
    // resolvers,
  });
};

export const initApollo = (options: CreateClientProps): ApolloClient<NormalizedCacheObject> | undefined =>
  __SERVER__
    ? createClient(options)
    : !GlobalVars.browserApolloClient
    ? (GlobalVars.browserApolloClient = createClient(options))
    : GlobalVars.browserApolloClient;
