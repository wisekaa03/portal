/** @format */

// #region Imports NPM
import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { Query, ApolloProvider, QueryResult } from 'react-apollo';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import queryString from 'query-string';
import 'typeface-roboto';
// #endregion
// #region Imports Local
import theme from '../lib/theme';
import { CURRENT_USER, IS_LOGIN } from '../lib/queries';
import { ProfileContext, ApolloAppProps } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
import { Loading } from '../components/loading';
import { FIRST_PAGE } from '../lib/constants';
// #endregion

class MainApp extends App<ApolloAppProps> {
  componentDidMount(): void {
    // Remove the server-sie injectsed CSS
    const jssStyles = document.querySelector('#jss');
    if (jssStyles) {
      jssStyles.parentNode!.removeChild(jssStyles);
    }
  }

  render(): React.ReactElement {
    const { Component, apolloClient, pageProps, currentLanguage, isMobile } = this.props;

    const ssrMatchMedia = (query: any): any => ({
      matches: mediaQuery.match(query, {
        width: Boolean(isMobile) ? 0 : 1280,
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
          <Query query={IS_LOGIN} ssr={false}>
            {({ data: loginData, loading: loginLoading }: QueryResult<any>) => {
              if (loginLoading) {
                return <Loading type="linear" variant="indeterminate" />;
              }

              if (!loginData.isLogin && Router.pathname !== '/auth/login') {
                Router.push('/auth/login');

                return null;
              }

              return (
                <Query query={CURRENT_USER} ssr={false}>
                  {({ data, loading }: QueryResult<any>) => {
                    if (loading) {
                      return <Loading type="linear" variant="indeterminate" />;
                    }

                    if (data && data.me) {
                      if (Router.pathname === '/auth/login') {
                        let redirect: string | string[] | null | undefined;
                        try {
                          ({ redirect } = queryString.parse(window.location.search));
                        } catch (error) {
                          console.error('Redirect error:', redirect, error);
                        }
                        Router.push({ pathname: (redirect as string) || FIRST_PAGE });

                        return <Loading type="linear" variant="indeterminate" />;
                      }

                      return (
                        <ProfileContext.Provider
                          value={{
                            user: { ...(data && data.me) },
                            language: currentLanguage,
                            isMobile: Boolean(isMobile),
                          }}
                        >
                          <Component {...pageProps} />
                        </ProfileContext.Provider>
                      );
                    }

                    return <Component {...pageProps} />;
                  }}
                </Query>
              );
            }}
          </Query>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
