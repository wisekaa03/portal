/** @format */

// #region Imports NPM
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
// #endregion
// #region Imports Local
import { LOGOUT } from '../../lib/queries';
import LogoutComponent from '../../components/logout';
import { includeDefaultNamespaces, I18nPage } from '../../lib/i18n-client';
import { removeStorage } from '../../lib/session-storage';
import { Loading } from '../../components/loading';
// #endregion

const Logout: I18nPage = (props): React.ReactElement => {
  const client = useApolloClient();

  const [logout, { loading, error }] = useMutation(LOGOUT, {
    onCompleted() {
      removeStorage('session');
      client.resetStore();

      Router.push({ pathname: '/auth/login' });
    },
  });

  return (
    <Loading activate={loading} type="linear" variant="indeterminate">
      <LogoutComponent error={error} loading={loading} logout={logout} {...props} />
    </Loading>
  );
};

Logout.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['logout']),
  };
};

export default Logout;
