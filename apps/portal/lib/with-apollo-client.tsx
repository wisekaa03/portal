/** @format */

//#region Imports NPM
import React from 'react';
import { Request, Response } from 'express';
import { NextComponentType } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import { ApolloClient, ApolloError } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { isMobile as checkMobile } from 'is-mobile';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { ConfigService } from '@app/config';

import type { Data, UserContext, AppPortalProps, AppPortalInitialProps } from '@lib/types';
// import { nextI18next } from './i18n-client';

import { FONT_SIZE_NORMAL } from './constants';
import { CURRENT_USER } from './queries';
import { initApollo, GlobalVars } from './init-apollo';
//#endregion

export const withApolloClient = (
  MainApp: NextComponentType<AppContext, AppPortalInitialProps, AppPortalProps>,
): NextComponentType<AppContext, AppPortalInitialProps, AppPortalProps> =>
  class Apollo extends React.Component<AppPortalProps> {
    private apolloClient?: ApolloClient<NormalizedCacheObject>;

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

        GlobalVars.configService = response.locals?.config as ConfigService;
        GlobalVars.logger = GlobalVars.configService.logger;

        const apolloClient = initApollo({
          cookie: request.headers?.cookie,
        });

        let user: User | undefined;
        try {
          if (request.user?.username) {
            const me = await apolloClient?.query<Data<'me', User>, undefined>({
              query: CURRENT_USER,
            });
            user = me?.data.me;
          }
        } catch (error: unknown) {
          if (!(error instanceof ApolloError) && error instanceof Error) {
            GlobalVars.logger.error({
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
            GlobalVars.logger.error({
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
          apollo: apolloClient?.cache.extract(),
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
      if (__SERVER__ && GlobalVars.configService?.logger) {
        GlobalVars.logger = GlobalVars.configService?.logger;
      }

      return <MainApp {...this.props} apolloClient={this.apolloClient} />;
    }
  };
