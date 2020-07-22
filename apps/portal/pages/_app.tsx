/** @format */

//#region Imports NPM
import React, { useEffect } from 'react';
import { Request } from 'express';
import { NextPageContext } from 'next';
import NextApp from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { ApolloProvider, useQuery, QueryResult } from '@apollo/client';
import { ThemeProvider, StylesProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import { SnackbarProvider } from 'notistack';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
//#endregion
//#region Imports Local
import { MaterialUI } from '@lib/theme';
import { CURRENT_USER } from '@lib/queries';
import { ProfileContext } from '@lib/context';
import { AppContextMy, Data, User, UserContext } from '@lib/types';
import { withApolloClient } from '@lib/with-apollo-client';
import { appWithTranslation } from '@lib/i18n-client';
import { SnackbarUtilsConfigurator } from '@lib/snackbar-utils';
import { AUTH_PAGE, FIRST_PAGE } from '@lib/constants';
import { changeFontSize } from '@lib/font-size';
import getRedirect from '@lib/get-redirect';
//#endregion

/**
 * Current profile provider
 */
const ProfileProvider: React.FC<{
  context: UserContext;
  ctx: NextPageContext;
  router: NextRouter;
  children: React.ReactNode;
}> = ({ context, ctx, router, children }): React.ReactElement | null => {
  const pathname = ctx?.asPath || router?.asPath;

  const { data, loading } = useQuery<Data<'me', User>>(CURRENT_USER, {
    // TODO: https://github.com/apollographql/react-apollo/issues/2522
    // TODO: https://github.com/apollographql/react-apollo/issues/3353
    // TODO: https://github.com/apollographql/react-apollo/pull/3419
    // onCompleted(data) {
    //   if (!__SERVER__) {
    //     if (data?.me?.settings?.fontSize) {
    //       changeFontSize(data.me.settings.fontSize);
    //     }
    //   }
    // },
    // variables: {},
    fetchPolicy: 'cache-only',
  });

  if (__SERVER__) {
    if (ctx?.res && ctx?.req) {
      if (data?.me) {
        if (pathname.startsWith(AUTH_PAGE)) {
          const location = decodeURI((ctx.req as Request).query['redirect'] as string) || FIRST_PAGE;

          ctx.res.statusCode = 303;
          ctx.res.setHeader('Location', location);

          return null;
        }
      } else if (!loading && ctx.req?.url && !ctx.req.url.startsWith(AUTH_PAGE)) {
        const location = `${AUTH_PAGE}?redirect=${getRedirect(ctx.req.url)}`;

        ctx.res.statusCode = 303;
        ctx.res.setHeader('Location', location);

        return null;
      }
    }
  } else {
    useEffect(() => {
      if (data?.me?.settings?.fontSize) {
        changeFontSize(data.me.settings.fontSize);
      }
    }, [data]);
  }

  return <ProfileContext.Provider value={{ ...context, user: data?.me }}>{children}</ProfileContext.Provider>;
};

/**
 * App
 */
class App extends NextApp<AppContextMy> {
  componentDidMount(): void {
    // Remove the server-sie injected CSS
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
  }

  render(): React.ReactElement {
    const { disableGeneration = false, Component, apolloClient, pageProps, context, router, ctx } = this.props;

    const ssrMatchMedia = (query: string) => ({
      matches: mediaQuery.match(query, {
        width: context.isMobile ? 0 : 1280,
      }),
    });

    const themeUser = MaterialUI(context?.fontSize, ssrMatchMedia);

    return (
      <StylesProvider disableGeneration={disableGeneration}>
        <ThemeProvider theme={themeUser}>
          <CssBaseline />
          <ApolloProvider client={apolloClient}>
            <Head>
              <title>Корпоративный портал</title>
            </Head>
            <SnackbarProvider
              maxSnack={3}
              dense={context.isMobile}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <DndProvider backend={context.isMobile ? TouchBackend : HTML5Backend}>
                <SnackbarUtilsConfigurator />
                <ProfileProvider context={context} router={router} ctx={ctx}>
                  <Component {...pageProps} />
                </ProfileProvider>
              </DndProvider>
            </SnackbarProvider>
          </ApolloProvider>
        </ThemeProvider>
      </StylesProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(App));
