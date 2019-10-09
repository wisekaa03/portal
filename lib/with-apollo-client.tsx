/** @format */
/* eslint @typescript-eslint/indent:0 */

// #region Imports NPM
import React from 'react';
import { getDataFromTree } from 'react-apollo';

import Head from 'next/head';
// eslint-disable-next-line import/no-named-default
import { AppContext, default as NextApp } from 'next/app';

import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
// #endregion
// #region Imports Local
import { nextI18next } from './i18n-client';
import { apolloClient } from './apollo-client';
import { ApolloAppProps, WithApolloState, ApolloInitialProps } from './types';
// #endregion

export const withApolloClient = (MainApp: any /* typeof NextApp */): Function => {
  return class ApolloClass extends React.Component<ApolloAppProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    // eslint-disable-next-line react/static-property-placement
    public static displayName = 'withApolloClient(MainApp)';

    public static async getInitialProps(appCtx: AppContext): Promise<ApolloInitialProps> {
      const { ctx } = appCtx;
      const apolloState: WithApolloState = {};

      const currentLanguage = ctx.req ? ((ctx.req as unknown) as Express.Request).lng : nextI18next.i18n.language;

      // eslint-disable-next-line no-debugger
      // debugger;

      const appProps = MainApp.getInitialProps ? await MainApp.getInitialProps(appCtx) : { pageProps: {} };

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apollo = apolloClient();

      if (__SERVER__) {
        try {
          await getDataFromTree(<MainApp {...appProps} {...appCtx} apolloClient={apollo} />);
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          console.error('Error while running `getDataFromTree`', error);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      apolloState.data = apollo.cache.extract();

      // Extract query data from the Apollo store
      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      return {
        ...appProps,
        currentLanguage,
        apolloState,
      };
    }

    public constructor(props: any) {
      super(props);

      // `getDataFromTree` renders the component first, the client is passed off as a property.
      // After that rendering is done using Next's normal rendering pipeline
      this.apolloClient = this.apolloClient || apolloClient(props.apolloState);
    }

    public render(): React.ReactElement {
      return <MainApp {...this.props} apolloClient={this.apolloClient} />;
    }
  };
};
