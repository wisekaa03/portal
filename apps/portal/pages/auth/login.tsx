/** @format */

// #region Imports NPM
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import { useApolloClient, useLazyQuery } from '@apollo/react-hooks';
import queryString from 'query-string';
import Router from 'next/router';
// #endregion
// #region Imports Local
import { Data, LoginValuesProps, LoginPageProps } from '@lib/types';
// import { setStorage, removeStorage } from '@lib/session-storage';
import { FIRST_PAGE } from '@lib/constants';
import { User } from '@lib/types/user.dto';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '@lib/i18n-client';
import Cookie from '@lib/cookie';
import { LOGIN } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import { LoginComponent } from '@front/components/auth/login';
// #endregion

const AuthLoginPage: I18nPage<LoginPageProps> = ({ t, initUsername }): React.ReactElement => {
  const client = useApolloClient();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<LoginValuesProps>({
    save: !!initUsername,
    username: initUsername,
    password: '',
  });

  const [login, { loading, error }] = useLazyQuery<Data<'login', boolean>, { username: string; password: string }>(
    LOGIN,
    {
      onCompleted: (data) => {
        if (data.login) {
          client.resetStore();

          const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
          Router.push(redirect as string);
        }
      },
    },
  );

  const handleValues = (name: keyof LoginValuesProps) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean = el.type === 'checkbox' ? el.checked : el.value;

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (): void => {
    const { username, password } = values;

    if (username.trim() === '') {
      usernameRef.current!.focus();
    } else if (password.trim() === '') {
      passwordRef.current!.focus();
    } else {
      login({ variables: { username, password } });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (values.save) {
      Cookie.set('username', values.username);
    } else {
      Cookie.remove('username');
    }
  }, [values.save, values.username]);

  useEffect(() => {
    if (usernameRef.current && initUsername) {
      passwordRef.current!.focus();
    }
  }, [usernameRef, passwordRef, initUsername]);

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
      passwordRef.current!.focus();
    }
  }, [passwordRef, error]);

  return (
    <>
      <Head>
        <title>{t('login:title')}</title>
      </Head>
      <LoginComponent
        usernameRef={usernameRef}
        passwordRef={passwordRef}
        values={values}
        loading={loading}
        handleValues={handleValues}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
      />
    </>
  );
};

AuthLoginPage.getInitialProps = (ctx) => {
  const { username } = Cookie.get(ctx);

  return {
    initUsername: username || '',
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default nextI18next.withTranslation('login')(AuthLoginPage);
