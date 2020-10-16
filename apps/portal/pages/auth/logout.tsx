/** @format */

//#region Imports NPM
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation } from '@apollo/client';
//#endregion
//#region Imports Local
import { nextI18next, includeDefaultNamespaces, I18nPage } from '@lib/i18n-client';
import { LOGOUT } from '@lib/queries';
import { removeStorage } from '@lib/session-storage';
import { SESSION, AUTH_PAGE, FIRST_PAGE } from '@lib/constants';
import snackbarUtils from '@lib/snackbar-utils';
import Cookie from '@lib/cookie';
import getRedirect from '@lib/get-redirect';
import LogoutComponent from '@front/components/auth/logout';
//#endregion

const Logout: I18nPage = ({ t }) => {
  const client = useApolloClient();
  const router = useRouter();

  const [logout, { loading, error: errorLogout }] = useMutation(LOGOUT, {
    onCompleted: () => {
      removeStorage(SESSION);
      Cookie.remove(process.env.SESSION_NAME || 'portal');

      client
        .clearStore()
        .then(() => {
          client.resetStore();
          const { pathname = FIRST_PAGE } = router;
          return router.push({ pathname: AUTH_PAGE, query: { redirect: getRedirect(pathname) } });
        })
        .catch((error) => {
          throw error;
        });
    },
  });

  useEffect(() => {
    if (errorLogout) {
      snackbarUtils.error(errorLogout);
    }
  }, [errorLogout]);

  return (
    <>
      <Head>
        <title>{t('login:titleLogout')}</title>
      </Head>
      <LogoutComponent loading={loading} logout={logout} />
    </>
  );
};

Logout.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['login']),
});

export default nextI18next.withTranslation('login')(Logout);
