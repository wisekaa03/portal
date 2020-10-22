/** @format */

//#region Imports NPM
import React from 'react';
import { Request, Response } from 'express';
import { NextComponentType } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { GraphQLError, OperationDefinitionNode } from 'graphql';
import { ApolloClient, ApolloError, from, split, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
// import { SchemaLink } from '@apollo/client/link/schema';
import { createUploadLink } from 'apollo-upload-client';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { isMobile as checkMobile } from 'is-mobile';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { Data, User, UserContext, AppPortalProps, AppPortalInitialProps } from '@lib/types';
// import { nextI18next } from './i18n-client';
import { resolvers } from './state-link';
import getRedirect from './get-redirect';

import { AUTH_PAGE, FONT_SIZE_NORMAL } from './constants';
import { CURRENT_USER } from './queries';
//#endregion

interface CreateClientProps {
  initialState?: NormalizedCacheObject;
  cookie?: string;
}

let configService: ConfigService | undefined;
let logger: Logger | typeof console = console;
let browserApolloClient: ApolloClient<NormalizedCacheObject>;

const createClient = ({ initialState, cookie }: CreateClientProps) => {
  const errorMiddleware = onError(({ graphQLErrors, networkError, operation /* , response */ }) => {
    if (__SERVER__) {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions /* , path, locations, originalError */ }) => {
          const definition = operation.query.definitions[0] as OperationDefinitionNode;
          if (message !== 'Unauthorized') {
            logger.error({
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
        logger.error({
          message: `NetworkError: ${networkError.toString()}`,
          error: networkError,
          context: 'GraphQL backend',
          function: 'errorMiddleware',
        });
      }
    } else {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions /* , locations, path, originalError */ }) => {
          const definition = operation.query.definitions[0] as OperationDefinitionNode;
          if (message !== 'Unauthorized') {
            logger.error({
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
        logger.error({
          message: `NetworkError: ${networkError.toString()}`,
          error: networkError,
          context: 'GraphQL frontend',
          function: 'errorMiddleware',
        });
      }
    }
  });

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

  let link: ApolloLink;

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

  if (__SERVER__) {
    // if (configService?.schema) {
    //   link = new SchemaLink({ schema: configService?.schema });
    // } else {
    link = new ApolloLink();
    // eslint-disable-next-line global-require
    global.fetch = require('node-fetch');

    let fetchOptions: Record<string, unknown> | undefined;
    if (configService?.secure) {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const https = require('https');

      fetchOptions = {
        agent: new https.Agent({ rejectUnauthorized: false }),
      };
    }

    const PORT = configService?.get<number>('PORT') || 4000;
    link = new HttpLink({
      uri: `${configService?.secure ? 'https:' : 'http:'}//localhost:${PORT}/graphql`,
      credentials: 'same-origin',
      fetchOptions,
    });
    // }
  } else {
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

    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      (httpLink as unknown) as ApolloLink,
    );
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__,
    link: from([errorMiddleware, authMiddleware, link]),
    cache,
    resolvers,
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

export const withApolloClient = (
  MainApp: NextComponentType<AppContext, AppPortalInitialProps, AppPortalProps>,
): NextComponentType<AppContext, AppPortalInitialProps, AppPortalProps> =>
  class Apollo extends React.Component<AppPortalProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    static displayName = 'withApolloClient(App)';

    public static async getInitialProps({ AppTree, Component, router, ctx }: AppContext): Promise<AppPortalInitialProps> {
      const appProps =
        typeof MainApp.getInitialProps === 'function'
          ? await MainApp.getInitialProps({ AppTree, Component, router, ctx })
          : { pageProps: { apollo: null } };

      if (__SERVER__) {
        const request = ctx.req as Request;
        const response = ctx.res as Response;
        if (response.writableEnded) {
          return appProps;
        }

        configService = response.locals?.config as ConfigService;
        logger = configService.logger;

        const apolloClient = initApollo({
          cookie: request.headers?.cookie,
        });

        let user: User | undefined;
        try {
          if (request.user?.username) {
            const { data } = await apolloClient.query<Data<'me', User>, undefined>({
              query: CURRENT_USER,
            });
            user = data?.me;
          }
        } catch (error: unknown) {
          if (!(error instanceof ApolloError) && error instanceof Error) {
            logger.error({
              message: `Query "CURRENT_USER": ${error.toString()}`,
              statusCode: 500,
              error,
              context: 'GraphQL backend',
              username: request?.user?.username,
              headers: request?.headers,
              function: 'withApolloClient',
            });
          }
        }
        const language = user?.settings?.lng || lngFromReq(request) || 'en';
        const isMobile = checkMobile({ ua: request.headers['user-agent'] }) ?? false;
        const context: UserContext = {
          fontSize: user?.settings?.fontSize || FONT_SIZE_NORMAL,
          isMobile,
          language,
        };

        try {
          const { getDataFromTree } = await import('@apollo/client/react/ssr');

          await getDataFromTree(
            <AppTree
              {...appProps}
              // disableGeneration
              ctx={ctx}
              Component={Component}
              router={router}
              apolloClient={apolloClient}
              context={context}
            />,
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          if (
            error instanceof ApolloError &&
            !error.graphQLErrors.some(
              (graphQLError) => graphQLError.extensions?.exception?.status >= 401 && graphQLError.extensions?.exception?.status <= 403,
            )
          ) {
            logger.error({
              message: `getDataFromTree: ${error.toString()}`,
              error,
              context: 'GraphQL backend',
              username: request?.user?.username,
              headers: request?.headers,
              function: 'withApolloClient',
            });
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();

        return {
          ...appProps,
          context,
          apollo: apolloClient.cache.extract(),
        };
      }

      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      return {
        ...appProps,
        context: { isMobile: false, language: appProps.initialLanguage },
      };
    }

    public constructor(props: AppPortalProps) {
      super(props);

      if (__SERVER__ && props.apolloClient) {
        this.apolloClient = props.apolloClient;
      } else {
        this.apolloClient = initApollo({
          initialState: props.apollo,
        });
      }
    }

    public render(): React.ReactElement {
      if (__SERVER__ && configService?.logger) {
        logger = configService?.logger;
      }

      return <MainApp {...this.props} apolloClient={this.apolloClient} />;
    }
  };
