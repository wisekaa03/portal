/** @format */

// #region Imports NPM
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
// #endregion
// #region Imports Local
import { nextI18next, includeDefaultNamespaces, I18nPage } from '../../lib/i18n-client';
import { LOGOUT } from '../../lib/queries';
import LogoutComponent from '../../components/logout';
import Cookies from '../../lib/cookie';
import { removeStorage } from '../../lib/session-storage';
import { SESSION, AUTH_PAGE } from '../../lib/constants';
import snackbarUtils from '../../lib/snackbar-utils';
// #endregion

const Logout: I18nPage = ({ t }): React.ReactElement => {
  const client = useApolloClient();
  const router = useRouter();

  const [logout, { loading, error }] = useMutation(LOGOUT, {
    onCompleted: () => {
      removeStorage(SESSION);
      Cookies.remove(process.env.SESSION_NAME);
      client.resetStore();

      router.push({ pathname: AUTH_PAGE });
    },
  });

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
  }, [error]);

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
