/** @format */

// #region Imports NPM
import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import { Query, ApolloProvider } from 'react-apollo';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'typeface-roboto'; // TODO: error in css-loader/locals
// #endregion
// #region Imports Local
import theme from '../lib/theme';
import { CURRENT_USER } from '../lib/queries';
import { ProfileContext, ApolloAppProps } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
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

    // TODO: разобраться как isMobile прикрутить к теме
    // const ssrMatchMedia = (query: any): any => ({
    //   matches: mediaQuery.match(query, {
    //     width: isMobile ? 0 : 1024,
    //   }),
    // });

    // eslint-disable-next-line no-debugger
    // debugger;

    return (
      <ApolloProvider client={apolloClient}>
        <Head>
          <title>Portal</title>
        </Head>
        {/* MuiThemeProvider makes the theme available down the React
              tree thanks to React context. */}
        <CssBaseline />
        <ThemeProvider theme={theme}>
          {/* TODO: разобраться с тем, что graphql запрос на сервере неавторизован, на клиенте нормально */}
          <Query query={CURRENT_USER} ssr={false}>
            {({ data }: { data: any }) => {
              const user = data;

              // eslint-disable-next-line no-debugger
              debugger;

              return (
                <ProfileContext.Provider value={{ ...user, language: currentLanguage }}>
                  <Component {...pageProps} />
                </ProfileContext.Provider>
              );
            }}
          </Query>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
