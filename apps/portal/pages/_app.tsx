/** @format */

// #region Imports NPM
import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
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
import { ProfileContext } from '../lib/context';
import { ApolloAppProps, Data } from '../lib/types';
import { withApolloClient } from '../lib/with-apollo-client';
import { appWithTranslation } from '../lib/i18n-client';
import { Loading } from '../components/loading';
import { User } from '../src/user/models/user.dto';
import { FIRST_PAGE, ADMIN_PAGES } from '../lib/constants';
// #endregion

// const LoginPage = dynamic(() => import('./auth/login'));

const InnerLogin: React.FC<{
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
  isMobile: boolean;
  language: string;
  router: NextRouter;
}> = ({ Component, pageProps, isMobile, language, router }): React.ReactElement | null => {
  // let me;

  const { loading, data }: QueryResult<Data<'me', User>> = useQuery(CURRENT_USER);

  const user = data ? data.me : undefined;

  // TODO: продумать как на клиенте запрещать админ панель
  // if (ADMIN_PAGES.includes(router.pathname) && (!user || (user && !user.isAdmin))) {
  //   router.push(FIRST_PAGE);
  // }

  return loading ? (
    <Loading noMargin type="linear" variant="indeterminate" />
  ) : (
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
  const pathname = (ctx && ctx.pathname) || (router && router.pathname);

  if (__SERVER__) {
    // SERVER
    const req = ctx && ((ctx.req as unknown) as Express.Request);
    const res = ctx && (ctx.res as any);
    const user = req && req.session && req.session.passport && req.session.passport.user;

    if (!user) {
      if (pathname === '/auth/login') {
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
        res.redirect(`/auth/login?redirect=${pathname}`);

        throw new UnauthorizedException();
      }
    } else if (ADMIN_PAGES.includes(pathname) && (!user || (user && !user.isAdmin))) {
      if (res) {
        res.status(404);
        res.redirect(FIRST_PAGE);

        // TODO: не работает, так же не работает ошибка 404 если вбить произвольную ссылку
        // throw new NotFoundException();
      }
    }
  } else {
    // CLIENT
    // eslint-disable-next-line no-debugger
    // debugger;
  }

  if (pathname !== '/auth/login') {
    return (
      <InnerLogin Component={Component} pageProps={pageProps} isMobile={isMobile} language={language} router={router} />
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
