/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryResult } from 'react-apollo';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { ThemeProvider, StylesProvider } from '@material-ui/styles';
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
import { User } from '../src/user/models/user.dto';
import getCookie from '../lib/get-cookie';
import getRedirect from '../lib/get-redirect';
import { SnackbarUtilsConfigurator } from '../lib/snackbar-utils';
// #endregion

/**
 * Current login: ME
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
  const [user, setUser] = useState<User>(undefined);

  if (__SERVER__) {
    const { req, res }: { req?: any; res?: any } = ctx || {};

    if (res && !pathname.startsWith('/auth/login') && !(req?.session?.passport?.user as User)) {
      res.status(401);
      res.redirect(`/auth/login?redirect=${redirect}`);

      throw new UnauthorizedException();
    }
  } else if (!getCookie() && !pathname.startsWith('/auth/login')) {
    router.push({ pathname: '/auth/login', query: { redirect } });

    throw new UnauthorizedException();
  }

  const { loading, data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER, {
    ssr: true,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);

  return (
    <ProfileContext.Provider
      value={{
        user,
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
    const {
      disableGeneration = false,
      Component,
      apolloClient,
      pageProps,
      currentLanguage,
      isMobile,
      router,
      ctx,
    } = this.props;

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
          <StylesProvider disableGeneration={disableGeneration}>
            <CssBaseline />
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
          </StylesProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
