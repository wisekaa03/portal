/** @format */

//#region Imports NPM
import React, { useEffect } from 'react';
import { Request } from 'express';
import { NextPageContext } from 'next';
import BasicApp from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { ApolloProvider, useQuery } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { ThemeProvider, StylesProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import 'jodit/build/jodit.es2018.min.css';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';

import { AUTH_PAGE, FIRST_PAGE } from '@lib/constants';
import { MaterialUI } from '@lib/theme';
import { CURRENT_USER } from '@lib/queries';
import { ProfileContext } from '@lib/context';
import type { AppPortalProps, AppPortalContext, Data, UserContext, AppPortalInitialProps } from '@lib/types';
import { withApolloClient } from '@lib/with-apollo-client';
import { appWithTranslation } from '@lib/i18n-client';
import { SnackbarUtilsConfigurator } from '@lib/snackbar-utils';
import { changeFontSize } from '@lib/font-size';
import getRedirect from '@lib/get-redirect';
//#endregion

/**
 * Current profile provider
 */
const ProfileProvider: React.FC<{
  context: UserContext;
  router: NextRouter;
  children: React.ReactNode;
  ctx?: NextPageContext;
}> = ({ context, ctx, router, children }) => {
  const pathname = ctx?.asPath || router?.asPath;

  const { data, loading } = useQuery<Data<'me', User>, undefined>(CURRENT_USER, {
    fetchPolicy: 'cache-first',
  });

  if (__SERVER__) {
    if (ctx && ctx.res && ctx.req) {
      if (data?.me) {
        if (pathname.startsWith(AUTH_PAGE)) {
          const location = decodeURI((ctx.req as Request).query.redirect as string) || FIRST_PAGE;
          ctx.res.statusCode = 303;
          ctx.res.setHeader('Location', location);
          return null;
        }
      } else if (!loading) {
        if (ctx.req?.url && !ctx.req.url.startsWith(AUTH_PAGE)) {
          const location = `${AUTH_PAGE}?redirect=${getRedirect(ctx.req.url)}`;
          ctx.res.statusCode = 303;
          ctx.res.setHeader('Location', location);
          return null;
        }
      }
    }
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (data?.me?.settings) {
        changeFontSize(data.me.settings.fontSize);
      }
    }, [data]);
  }

  return <ProfileContext.Provider value={{ ...context, user: data?.me }}>{children}</ProfileContext.Provider>;
};

/**
 * App
 */
const App = ({ disableGeneration = false, Component, apolloClient, pageProps, context, router, ctx }: AppPortalProps) => {
  useEffect(() => {
    document.querySelector('#jss-server-side')?.remove();

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
  }, []);

  const ssrMatchMedia = (query: string) => ({
    matches: mediaQuery.match(query, {
      width: context.isMobile ? 0 : 1280,
    }),
  });

  const { fontSize = 16, isMobile } = context;
  const themeUser = MaterialUI(fontSize, ssrMatchMedia);

  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
      </Head>
      <StylesProvider disableGeneration={disableGeneration}>
        <ThemeProvider theme={themeUser}>
          <CssBaseline />
          <ApolloProvider client={apolloClient}>
            <Head>
              <title>Corporate portal</title>
            </Head>
            <SnackbarProvider
              maxSnack={3}
              dense={isMobile}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
                <SnackbarUtilsConfigurator />
                <ProfileProvider context={context} router={router} ctx={ctx}>
                  <Component {...pageProps} context={context} router={router} ctx={ctx} />
                </ProfileProvider>
              </DndProvider>
            </SnackbarProvider>
          </ApolloProvider>
        </ThemeProvider>
      </StylesProvider>
    </>
  );
};

App.getInitialProps = async (appContext: AppPortalContext): Promise<AppPortalInitialProps> => ({
  ...(await BasicApp.getInitialProps(appContext)),
});

export default withApolloClient(appWithTranslation(App));
