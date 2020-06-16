/** @format */

//#region Imports NPM
import React from 'react';
import { NextPageContext } from 'next';
import NextApp from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { QueryResult } from 'react-apollo';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { ThemeProvider, StylesProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import mediaQuery from 'css-mediaquery';
import { SnackbarProvider } from 'notistack';
//#endregion
//#region Imports Local
import { MaterialUI_fck } from '@lib/theme';
import { CURRENT_USER } from '@lib/queries';
import { ProfileContext } from '@lib/context';
import { AppContextMy, Data, User, UserContext } from '@lib/types';
import { withApolloClient } from '@lib/with-apollo-client';
import { appWithTranslation } from '@lib/i18n-client';
import { SnackbarUtilsConfigurator } from '@lib/snackbar-utils';
import { AUTH_PAGE } from '@lib/constants';
import { changeFontSize } from '@lib/font-size';
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
    onCompleted: (data) => {
      if (data?.me?.settings?.fontSize) {
        changeFontSize(data.me.settings.fontSize);
      }
    },
    fetchPolicy: 'cache-first',
  });

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

    const themeUser = MaterialUI_fck(context?.fontSize, ssrMatchMedia);

    return (
      <>
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
                <>
                  <SnackbarUtilsConfigurator />
                  <CurrentComponent context={context} router={router} ctx={ctx}>
                    <Component {...pageProps} />
                  </CurrentComponent>
                </>
              </SnackbarProvider>
            </ApolloProvider>
          </ThemeProvider>
        </StylesProvider>
      </>
    );
  }
}

export default withApolloClient(appWithTranslation(App));
