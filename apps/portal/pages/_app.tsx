/** @format */

// #region Imports NPM
import React from 'react';
import { NextPageContext } from 'next';
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
import url from 'url';
// #endregion
// #region Imports Local
import theme from '../lib/theme';
import { CURRENT_USER } from '../lib/queries';
import { ProfileContext } from '../lib/context';
import { ApolloAppProps, Data } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
import { User, UserContext } from '../src/user/models/user.dto';
import Cookie from '../lib/cookie';
import getRedirect from '../lib/get-redirect';
import { SnackbarUtilsConfigurator } from '../lib/snackbar-utils';
import { FIRST_PAGE, AUTH_PAGE, HIDDEN_PAGES } from '../lib/constants';
// #endregion

/**
 * Current login: ME
 */
const CurrentComponent: React.FC<{
  context: UserContext;
  ctx: NextPageContext;
  router: NextRouter;
  children: React.ReactNode;
}> = ({ context, ctx, router, children }): React.ReactElement | null => {
  // const [user, setUser] = useState<User>(undefined);

  const pathname = ctx?.asPath || router?.asPath;
  const redirectUrl = { pathname: AUTH_PAGE, query: { redirect: getRedirect(pathname) } };

  if (__SERVER__) {
    const { req, res }: { req?: any; res?: any } = ctx || {};
    const isAuthPage = pathname.startsWith(AUTH_PAGE);
    const user = req?.session?.passport?.user as User;

    if (res) {
      if (!user) {
        if (!isAuthPage) {
          res.status(401);
          res.redirect(url.format(redirectUrl));

          throw new UnauthorizedException();
        }
      } else if (isAuthPage || (!user.isAdmin && HIDDEN_PAGES.some((page) => pathname.startsWith(page)))) {
        res.status(401);
        res.redirect(FIRST_PAGE);
      }
    }
  } else if (!Cookie.get(ctx)?.[process.env.SESSION_NAME] && !pathname.startsWith(AUTH_PAGE)) {
    router.push(redirectUrl);

    throw new UnauthorizedException();
  }

  const { data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER, {
    fetchPolicy: 'cache-first',
  });

  return <ProfileContext.Provider value={{ ...context, user: data?.me }}>{children}</ProfileContext.Provider>;
};

/**
 * App
 */
class MainApp extends App<ApolloAppProps> {
  componentDidMount(): void {
    // Remove the server-sie injectsed CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentNode!.removeChild(jssStyles);
    }

    // Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/_next/static/sw.js')
        .then((/* registration */) => {
          return console.log('service worker registration successful');
        })
        .catch((err) => {
          console.warn('service worker registration failed', err.message);
        });
    }
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
              <SnackbarUtilsConfigurator />
              <CurrentComponent context={context} router={router} ctx={ctx}>
                <Component {...pageProps} />
              </CurrentComponent>
            </SnackbarProvider>
          </StylesProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApolloClient(appWithTranslation(MainApp));
