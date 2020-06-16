/** @format */

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
import { SnackbarProvider } from 'notistack';
// import url from 'url';
//#endregion
//#region Imports Local
import { MaterialUI_fck } from '@lib/theme';
import { CURRENT_USER } from '@lib/queries';
import { ProfileContext } from '@lib/context';
import { ApolloAppProps, Data, User, UserContext } from '@lib/types';
import { withApolloClient } from '@lib/with-apollo-client';
import { appWithTranslation } from '@lib/i18n-client';
// import Cookie from '@lib/cookie';
// import getRedirect from '@lib/get-redirect';
import { SnackbarUtilsConfigurator } from '@lib/snackbar-utils';
import { AUTH_PAGE, FONT_SIZE_NORMAL } from '@lib/constants';
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
      jssStyles.remove();
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
        width: context.isMobile ? 0 : 1280,
      }),
    });

    const themeUser = MaterialUI_fck(context?.fontSize || FONT_SIZE_NORMAL);
    const themeContext = {
      ...themeUser,
      props: {
        ...themeUser.props,
        MuiUseMediaQuery: {
          ssrMatchMedia,
        },
      },
    };

    return (
      <>
        <ThemeProvider theme={{ ...themeContext }}>
          <ApolloProvider client={apolloClient}>
            <Head>
              <title>Корпоративный портал</title>
            </Head>
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
          </ApolloProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
