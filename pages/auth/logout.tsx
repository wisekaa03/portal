/** @format */

// #region Imports NPM
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
// #endregion
// #region Imports Local
import { LOGOUT } from '../../lib/queries';
import { LogoutComponent } from '../../components/logout';
import { includeDefaultNamespaces } from '../../lib/i18n-client';
import { removeStorage } from '../../lib/session-storage';
// #endregion

const Logout = (): React.ReactElement => {
  const client = useApolloClient();

  const [logout, { loading, error }] = useMutation(LOGOUT, {
    onCompleted() {
      removeStorage('token');
      client.resetStore();

      Router.push({ pathname: '/auth/login' });
    },
  });

  return <LogoutComponent error={error} loading={loading} logout={logout} />;
};

Logout.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['logout']),
  };
};

export default Logout;
