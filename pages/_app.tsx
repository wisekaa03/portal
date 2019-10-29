/** @format */

// #region Imports NPM
import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
// import dynamic from 'next/dynamic';
import { Query, ApolloProvider, QueryResult } from 'react-apollo';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import 'typeface-roboto';
// #endregion
// #region Imports Local
import theme from '../lib/theme';
import { CURRENT_USER } from '../lib/queries';
import { ProfileContext, ApolloAppProps, Data } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
import { Loading } from '../components/loading';
import { User } from '../server/user/models/user.dto';
import { getStorage } from '../lib/session-storage';
import { SESSION } from '../lib/constants';
// #endregion

// const LoginPage = dynamic(() => import('./auth/login'));

/**
 * CurrentLogin
 */
const CurrentLogin: React.FC<{
  pageProps: any;
  isMobile: boolean;
  language: string;
  router: NextRouter;
  Component: NextComponentType<NextPageContext, any, {}>;
}> = ({ pageProps, isMobile, language, router, Component }): React.ReactElement | null => {
  if (__SERVER__) {
    // TODO: подумать все-таки над предложением Романа, cookie передаются в параметрах страничек,
    // TODO: graphql -> login обрабатывает подключение, далее странички запрашивают через graphql.
    // TODO: Eсли перезагрузить страничку то сначала появится Loading,
    // TODO: нужно поменять поведение-через cookie показывать
    // TODO: https://sergiodxa.com/articles/redirects-in-next-the-good-way/

    if (router.pathname !== '/auth/login') {
      return <Loading noMargin type="linear" variant="indeterminate" />;
    }
    return <Component {...pageProps} />;
  }

  const token = getStorage(SESSION);

  if (!!token) {
    return (
      <Query query={CURRENT_USER} ssr={false} fetchPolicy="cache-and-network">
        {({ data, loading }: QueryResult<Data<'me', User>>) => {
          if (data && data.me) {
            return (
              <ProfileContext.Provider
                value={{
                  user: { ...(data && data.me) },
                  language,
                  isMobile,
                }}
              >
                {loading && <Loading noMargin type="linear" variant="indeterminate" />}
                <Component {...pageProps} />
              </ProfileContext.Provider>
            );
          }

          return (
            <>
              {loading && <Loading noMargin type="linear" variant="indeterminate" />}
              <Component {...pageProps} />
            </>
          );
        }}
      </Query>
    );
  }

  // TODO: изначальная страница на клиенте который не прошел token
  if (Router.pathname !== '/auth/login') {
    Router.push({ pathname: '/auth/login' });

    return <Loading noMargin type="linear" variant="indeterminate" />;
  }

  return <Component {...pageProps} />;
};

/**
 * App
 */
class MainApp extends App<ApolloAppProps> {
  componentDidMount(): void {
    // Remove the server-sie injectsed CSS
    const jssStyles = document.querySelector('#jss');
    if (jssStyles) {
      jssStyles.parentNode!.removeChild(jssStyles);
    }
  }

  render(): React.ReactElement {
    const { Component, apolloClient, pageProps, currentLanguage, isMobile, router } = this.props;

    const ssrMatchMedia = (query: any): any => ({
      matches: mediaQuery.match(query, {
        width: !!isMobile ? 0 : 1280,
      }),
    });

    return (
      <ApolloProvider client={apolloClient}>
        <Head>
          <title>Portal</title>
        </Head>
        {/* MuiThemeProvider makes the theme available down the React
              tree thanks to React context. */}
        <CssBaseline />
        <ThemeProvider
          theme={{
            ...theme,
            props: {
              ...theme.props,
              MuiUseMediaQuery: {
                ssrMatchMedia,
              },
            },
          }}
        >
          <CurrentLogin
            pageProps={pageProps}
            isMobile={!!isMobile}
            language={currentLanguage || ''}
            Component={Component}
            router={router}
          />
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
