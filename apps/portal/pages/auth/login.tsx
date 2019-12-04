/** @format */

// #region Imports NPM
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { FetchResult } from 'apollo-link';
import queryString from 'query-string';
import Router from 'next/router';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import LoginComponent from '../../components/login';
import { includeDefaultNamespaces, I18nPage } from '../../lib/i18n-client';
import { setStorage, removeStorage } from '../../lib/session-storage';
import { Data } from '../../lib/types';
import { FIRST_PAGE, SESSION } from '../../lib/constants';
import { UserResponse } from '../../src/user/user.entity';
// #endregion

const Login: I18nPage = (props): React.ReactElement => {
  const client = useApolloClient();

  const [login, { loading, error, called }] = useMutation(LOGIN, {
    update(_cache, { data }: FetchResult<Data<'data', UserResponse>>) {
      debugger;
      if (data && data.login) {
        setStorage(SESSION, data.login.session);
        client.resetStore();

        const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
        Router.push(redirect as string);
      } else {
        removeStorage(SESSION);
      }
    },
  });

  return <LoginComponent error={error} loading={loading} called={called} login={login} {...props} />;
};

Login.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default Login;
