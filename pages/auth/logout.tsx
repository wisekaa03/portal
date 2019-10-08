/** @format */

// #region Imports NPM
import React from 'react';
import { Mutation, MutationFunction, MutationResult } from 'react-apollo';
// #endregion
// #region Imports Local
import { LOGOUT } from '../../lib/queries';
import { LogoutComponent } from '../../components/logout';
import { includeDefaultNamespaces } from '../../lib/i18n-client';
// #endregion

const Logout = (): React.ReactElement => {
  return (
    <Mutation mutation={LOGOUT} onError={() => {}}>
      {(logout: MutationFunction, { loading, error, data }: MutationResult<any>): JSX.Element | null => {
        if (!data) {
          return <LogoutComponent error={error} loading={loading} logout={logout} />;
        }

        // eslint-disable-next-line no-debugger
        debugger;

        sessionStorage.removeItem('token');
        window.location.pathname = '/auth/login';

        return null;
      }}
    </Mutation>
  );
};

Logout.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['logout']),
  };
};

export default Logout;
