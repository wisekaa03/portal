/** @format */

// #region Imports NPM
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Mutation, MutationFunction, MutationResult } from 'react-apollo';
// #endregion
// #region Imports Local
import { LOGIN } from '../../lib/queries';
import { LoginComponent } from '../../components/login';
// #endregion

export default function Login(): React.ReactElement {
  return (
    <Mutation
      mutation={LOGIN}
      onError={() => {}}
      onCompleted={({ login }: any) => {
        sessionStorage.setItem('token', login.token);

        // eslint-disable-next-line no-debugger
        debugger;

        // TODO: разобраться куда пользователь шел
        window.location.href = '/';
      }}
    >
      {(login: MutationFunction, { loading, error, data }: MutationResult<any>) => {
        return <LoginComponent error={error} loading={loading} login={login} />;
      }}
    </Mutation>
  );
}
