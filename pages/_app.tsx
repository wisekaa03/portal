/** @format */

// #region Imports NPM
import { Express } from 'express';
import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { UnauthorizedException } from '@nestjs/common';
// import dynamic from 'next/dynamic';
import { ApolloProvider, QueryResult } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
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
// #endregion

// const LoginPage = dynamic(() => import('./auth/login'));

const InnerLogin: React.FC<{
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
  isMobile: boolean;
  language: string;
}> = ({ Component, pageProps, isMobile, language }): React.ReactElement | null => {
  // let me;

  const { loading, data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER, {
    fetchPolicy: 'cache-first',
  });

  const user = data ? data.me : undefined;
  return (
    <ProfileContext.Provider
      value={{
        user,
        language,
        isMobile,
      }}
    >
      {loading && <Loading noMargin type="linear" variant="indeterminate" />}
      <Component {...pageProps} />
    </ProfileContext.Provider>
  );
};

/**
 * CurrentLogin
 */
const CurrentLogin: React.FC<{
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
  isMobile: boolean;
  language: string;
  ctx: NextPageContext;
  router: NextRouter;
}> = ({ Component, pageProps, isMobile, language, ctx, router }): React.ReactElement | null => {
  if (__SERVER__) {
    const req = ctx && ((ctx.req as unknown) as Express.Request);
    if (!(req && req.session && req.session.passport && req.session.passport.user)) {
      if ((ctx && ctx.pathname === '/auth/login') || (router && router.pathname === '/auth/login')) {
        return (
          <ProfileContext.Provider
            value={{
              user: undefined,
              language,
              isMobile,
            }}
          >
            <Component {...pageProps} />
          </ProfileContext.Provider>
        );
      }

      if (ctx && ctx.res) {
        (ctx.res as any).status(403);
        (ctx.res as any).location = '/auth/login';

        throw new UnauthorizedException();
      }
    }
  }

  if ((ctx && ctx.pathname !== '/auth/login') || (router && router.pathname !== '/auth/login')) {
    return <InnerLogin Component={Component} pageProps={pageProps} isMobile={isMobile} language={language} />;
  }

  return (
    <ProfileContext.Provider
      value={{
        user: undefined,
        language,
        isMobile,
      }}
    >
      <Component {...pageProps} />
    </ProfileContext.Provider>
  );
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
    const { Component, apolloClient, pageProps, currentLanguage, isMobile, router, ctx } = this.props;

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
            ctx={ctx}
          />
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
