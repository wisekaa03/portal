/** @format */

// #region Imports NPM
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import queryString from 'query-string';
import Router from 'next/router';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import { LoginComponent } from '../../components/login';
import { includeDefaultNamespaces } from '../../lib/i18n-client';
import { FIRST_PAGE } from '../../lib/constants';
import { setStorage } from '../../lib/session-storage';
import { Loading } from '../../components/loading';
// #endregion

const Login = (): React.ReactElement => {
  const client = useApolloClient();

  const [login, { loading, error }] = useMutation(LOGIN, {
    onCompleted(data) {
      setStorage('token', data.login.token);
      const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
      client.resetStore();
      // client.writeData({ data: { isLogin: true } });

      Router.push({ pathname: redirect as string });
    },
  });

  // if (loading) {
  //   return <Loading type="linear" variant="indeterminate" />;
  // }

  return <LoginComponent error={error} loading={loading} login={login} />;
};

Login.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default Login;
