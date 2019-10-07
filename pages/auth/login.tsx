/** @format */

// #region Imports NPM
import React from 'react';
import { Mutation, MutationFunction, MutationResult } from 'react-apollo';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import { LoginComponent } from '../../components/login';
import { useTranslation, includeDefaultNamespaces } from '../../lib/i18n-client';
// #endregion

const Login = (): React.ReactElement => {
  const { t, i18n } = useTranslation();

  return (
    <Mutation
      mutation={LOGIN}
      onError={() => {}}
      onCompleted={({ login }: any) => {
        if (login) {
          sessionStorage.setItem('token', login.token);

          // eslint-disable-next-line no-debugger
          debugger;

          // TODO: разобраться куда пользователь шел
          window.location.pathname = '/';
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
