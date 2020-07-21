/** @format */

//#region Imports NPM
import React, { useRef, useState, useEffect } from 'react';
import queryString from 'query-string';
import Router from 'next/router';
import Head from 'next/head';
import { useLazyQuery, useApolloClient } from '@apollo/client';
//#endregion
//#region Imports Local
import { Data, LoginValuesProps, LoginPageProps, Login } from '@lib/types';
import { FIRST_PAGE } from '@lib/constants';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '@lib/i18n-client';
import Cookie from '@lib/cookie';
import { CURRENT_USER, LOGIN } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import { setStorage } from '@lib/session-storage';
import { LoginComponent } from '@front/components/auth/login';
//#endregion

const AuthLoginPage: I18nPage<LoginPageProps> = ({ t, initUsername }): React.ReactElement => {
  const client = useApolloClient();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<LoginValuesProps>({
    save: !!initUsername,
    username: initUsername,
    password: '',
  });

  const [login, { loading, error }] = useLazyQuery<Data<'login', Login>, { username: string; password: string }>(
    LOGIN,
    {
      ssr: false,
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        if (data.login) {
          const { user } = data.login;
          client.writeQuery({
            query: CURRENT_USER,
            data: {
              me: user,
            },
          });

          const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
          Router.push(redirect as string);
        }
      },
    },
  );

  const handleValues = (name: keyof LoginValuesProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const element: EventTarget & HTMLInputElement = event.target;
    const value: string | boolean = element.type === 'checkbox' ? element.checked : element.value;

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const { username, password } = values;

    event.preventDefault();

    if (username.trim() === '') {
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    } else if (password.trim() === '') {
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    } else {
      login({ variables: { username, password } });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit((event as unknown) as React.MouseEvent<HTMLButtonElement, MouseEvent>);
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
    if (usernameRef.current && initUsername && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [usernameRef, passwordRef, initUsername]);

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
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
