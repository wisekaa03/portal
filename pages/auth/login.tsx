/** @format */

// #region Imports NPM
import React from 'react';
import { Mutation, MutationFunction, MutationResult } from 'react-apollo';
import queryString from 'query-string';
// import Router from 'next/router';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import { LoginComponent } from '../../components/login';
import { includeDefaultNamespaces } from '../../lib/i18n-client';
// #endregion

const Login = (): React.ReactElement => {
  return (
    <Mutation mutation={LOGIN} onError={() => {}}>
      {(login: MutationFunction, { loading, error, data }: MutationResult<any>): JSX.Element | null => {
        if (!data) {
          return <LoginComponent error={error} loading={loading} login={login} />;
        }

        // eslint-disable-next-line no-debugger
        // debugger;

        sessionStorage.setItem('token', data.login.token);
        const { redirect = '/' } = queryString.parse(window.location.search);
        window.location.href = redirect as string;
        // Router.push({ pathname: redirect as string });

        return null;
      }}
    </Mutation>
  );
};

Login.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default Login;
