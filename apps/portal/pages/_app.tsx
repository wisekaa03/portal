/** @format */
/* eslint import/no-default-export: 0 */

//#region Imports NPM
import React from 'react';
import { NextPageContext } from 'next';
import NextApp from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
// import { UnauthorizedException } from '@nestjs/common';
// import { Response, Request } from 'express';
import { QueryResult } from 'react-apollo';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { ThemeProvider, StylesProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import 'typeface-roboto';
import { SnackbarProvider } from 'notistack';
// import url from 'url';
//#endregion
//#region Imports Local
import theme from '@lib/theme';
import { CURRENT_USER } from '@lib/queries';
import { ProfileContext } from '@lib/context';
import { ApolloAppProps, Data, User, UserContext } from '@lib/types';
import { withApolloClient } from '@lib/with-apollo-client';
import { appWithTranslation } from '@lib/i18n-client';
// import Cookie from '@lib/cookie';
// import getRedirect from '@lib/get-redirect';
import { SnackbarUtilsConfigurator } from '@lib/snackbar-utils';
import { FIRST_PAGE, AUTH_PAGE, HIDDEN_PAGES } from '@lib/constants';
// import { getStorage } from '@lib/session-storage';
//#endregion

/**
 * Current login: ME
 */
const CurrentComponent: React.FC<{
  context: UserContext;
  ctx: NextPageContext;
  router: NextRouter;
  children: React.ReactNode;
}> = ({ context, ctx, router, children }): React.ReactElement | null => {
  const pathname = ctx?.asPath || router?.asPath;
  // const redirectUrl = { pathname: AUTH_PAGE, query: { redirect: getRedirect(pathname) } };

  // if (__SERVER__) {
  //   const { req, res }: { req?: any; res?: any } = ctx || {};
  //   const isAuthPage = pathname.startsWith(AUTH_PAGE);
  //   const userServer: User = req?.session?.passport?.user;

  //   if (res) {
  //     if (!userServer) {
  //       if (!isAuthPage) {
  //         res.status(401);
  //         res.redirect(url.format(redirectUrl));

  //         throw new UnauthorizedException();
  //       }
  //     } else if (isAuthPage || (!userServer.isAdmin && HIDDEN_PAGES.some((page) => pathname.startsWith(page)))) {
  //       res.status(401);
  //       res.redirect(FIRST_PAGE);
  //     }
  //   }
  // } else if (!Cookie.get(ctx)?.[process.env.SESSION_NAME || 'session'] && !pathname.startsWith(AUTH_PAGE)) {
  //   router.push(redirectUrl);
  // }

  if (__SERVER__ || pathname.startsWith(AUTH_PAGE)) {
    return <ProfileContext.Provider value={context}>{children}</ProfileContext.Provider>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER, {
    fetchPolicy: 'cache-first',
  });

  return <ProfileContext.Provider value={{ ...context, user: data?.me }}>{children}</ProfileContext.Provider>;
};

/**
 * App
 */
class MainApp extends NextApp<ApolloAppProps> {
  componentDidMount(): void {
    // Remove the server-sie injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentNode!.removeChild(jssStyles);
    }

    // Service worker
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/_next/static/sw.js')
    //     .then((/* registration */) => {
    //       return console.log('service worker registration successful');
    //     })
    //     .catch((err) => {
    //       console.warn('service worker registration failed', err.message);
    //     });
    // }
  }

  render(): React.ReactElement {
    const { disableGeneration = false, Component, apolloClient, pageProps, context, router, ctx } = this.props;

    const ssrMatchMedia = (query: any): any => ({
      matches: mediaQuery.match(query, {
        width: !!context.isMobile ? 0 : 1280,
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
              dense={context.isMobile}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <>
                <SnackbarUtilsConfigurator />
                <CurrentComponent context={context} router={router} ctx={ctx}>
                  <Component {...pageProps} />
                </CurrentComponent>
              </>
            </SnackbarProvider>
          </StylesProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
