/** @format */

import { ApolloClient } from 'apollo-client';
import { NextRouter } from 'next/router';
import { removeStorage } from './session-storage';

export default <TCache>(client: ApolloClient<TCache>, router: NextRouter, redirect?: string): any => {
  removeStorage('session');
  client.resetStore();

  if (router) {
    router.push({ pathname: '/auth/login', query: { redirect } });
  }
};
