/** @format */

// #region Imports NPM
import React from 'react';
import { Mutation, MutationFunction, MutationResult } from 'react-apollo';
import queryString from 'query-string';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import { LoginComponent } from '../../components/login';
import { includeDefaultNamespaces } from '../../lib/i18n-client';
// #endregion

const Login = (): React.ReactElement => {
  return (
    <Mutation
      mutation={LOGIN}
      onError={() => {}}
      onCompleted={({ login }: any) => {
        if (login) {
          sessionStorage.setItem('token', login.token);

          const props = queryString.parse(window.location.search);

          // TODO: разобраться как редиректить
          // window.location.href = redirect;
          // eslint-disable-next-line no-debugger
          // debugger;
        }
      }}
    >
      {(login: MutationFunction, { loading, error /* , data */ }: MutationResult<any>) => {
        return <LoginComponent error={error} loading={loading} login={login} />;
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
