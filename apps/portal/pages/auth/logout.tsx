/** @format */

// #region Imports NPM
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import Head from 'next/head';
// #endregion
// #region Imports Local
import { nextI18next, includeDefaultNamespaces, I18nPage } from '../../lib/i18n-client';
import { LOGOUT } from '../../lib/queries';
import LogoutComponent from '../../components/logout';
import { removeStorage } from '../../lib/session-storage';
import { SESSION } from '../../lib/constants';
// #endregion

const Logout: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const client = useApolloClient();

  const [logout, { loading, error }] = useMutation(LOGOUT, {
    onCompleted: () => {
      removeStorage(SESSION);
      client.resetStore();

      Router.push({ pathname: '/auth/login' });
    },
  });

  return (
    <>
      <Head>
        <title>{t('login:title')}</title>
      </Head>
      <LogoutComponent error={error} loading={loading} logout={logout} {...rest} />
    </>
  );
};

Logout.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default nextI18next.withTranslation('login')(Logout);
