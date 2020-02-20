/** @format */

// #region Imports NPM
import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryResult } from 'react-apollo';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import 'typeface-roboto';
import { SnackbarProvider } from 'notistack';
// #endregion
// #region Imports Local
import theme from '../lib/theme';
import { CURRENT_USER } from '../lib/queries';
import { ProfileContext } from '../lib/context';
import { ApolloAppProps, Data } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
import Loading from '../components/loading';
import { User } from '../src/user/models/user.dto';
import { FIRST_PAGE, ADMIN_PAGES } from '../lib/constants';
import getCookie from '../lib/get-cookie';
import getRedirect from '../lib/get-redirect';
import { SnackbarUtilsConfigurator } from '../lib/snackbar-utils';
// #endregion

const InnerLogin: React.FC<{
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
  isMobile: boolean;
  language: string;
  user: User;
}> = ({ Component, pageProps, isMobile, language, user: userServer }): React.ReactElement | null => {
  if (__SERVER__ && userServer) {
    return (
      <ProfileContext.Provider
        value={{
          user: userServer,
          language,
          isMobile,
        }}
      >
        <Component {...pageProps} />
      </ProfileContext.Provider>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { loading, data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER, {
    fetchPolicy: 'cache-first',
  });

  const user = data ? data.me : undefined;

  return (
    <Loading activate={loading} noMargin type="linear" variant="indeterminate">
      <ProfileContext.Provider
        value={{
          user,
          language,
          isMobile,
        }}
      >
        <Component {...pageProps} />
      </ProfileContext.Provider>
    </Loading>
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
  const pathname = ctx?.asPath || router?.asPath;
  const redirect = getRedirect(pathname);

  const { req, res }: { req?: any; res?: any } = ctx || {};
  const user: User = req?.session?.passport?.user;

  if (__SERVER__) {
    if (!user) {
      if (pathname.startsWith('/auth/login')) {
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

      if (res) {
        res.status(403);
        res.redirect(`/auth/login?redirect=${redirect}`);

        throw new UnauthorizedException();
      }
    } else if (ADMIN_PAGES.some((page) => pathname.startsWith(page)) && (!user || (user && !user.isAdmin))) {
      if (res) {
        res.status(404);
        res.redirect(FIRST_PAGE);

        // TODO: не работает, так же не работает ошибка 404 если вбить произвольную ссылку
        // throw new NotFoundException();
      }
    }
  } else {
    // CLIENT
    // eslint-disable-next-line no-lonely-if
    if (!getCookie() && !pathname.startsWith('/auth/login')) {
      router.push({ pathname: '/auth/login', query: { redirect } });
    }
  }

  if (!pathname.startsWith('/auth/login')) {
    return (
      <InnerLogin Component={Component} user={user} pageProps={pageProps} isMobile={isMobile} language={language} />
    );
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
    const jssStyles = document.querySelector('#jss-server-style');
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
          <SnackbarProvider
            maxSnack={3}
            dense={isMobile}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <SnackbarUtilsConfigurator />
            <CurrentLogin
              pageProps={pageProps}
              isMobile={!!isMobile}
              language={currentLanguage || ''}
              Component={Component}
              router={router}
              ctx={ctx}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
