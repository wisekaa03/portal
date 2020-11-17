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
import { LoginComponent } from '@front/components/auth/login';
//#endregion

const AuthLoginPage: I18nPage<LoginPageProps> = ({ t, initUsername, initDomain }) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const domainRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<LoginValuesProps>({
    save: !!initUsername,
    username: initUsername,
    password: '',
    domain: initDomain,
  });

  const [login, { data, loading, error, client }] = useLazyQuery<
    Data<'login', Login>,
    { username: string; password: string; domain: string }
  >(LOGIN, {
    ssr: false,
    fetchPolicy: 'no-cache',
  });

  const handleValues = (name: keyof LoginValuesProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const element: EventTarget & HTMLInputElement = event.target;
    const value: string | boolean = element.type === 'checkbox' ? element.checked : element.value;

    setValues({ ...values, [name]: value });
  };

  const handleDomain = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) => {
    const { value } = event.target;

    setValues({ ...values, domain: value as string });
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    const { username, password, domain } = values;

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
      login({ variables: { username, password, domain } });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit((event as unknown) as React.MouseEvent<HTMLButtonElement, MouseEvent>);
    }
  };

  useEffect(() => {
    const user = data?.login?.user;
    if (user && client) {
      client.writeQuery({
        query: CURRENT_USER,
        data: {
          me: user,
        },
      });

      const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
      Router.push(redirect as string);
    }
  }, [data, client]);

  useEffect(() => {
    if (values.save) {
      Cookie.set('username', values.username);
      Cookie.set('domain', values.domain);
    } else {
      Cookie.remove('username');
    }
  }, [values.save, values.username, values.domain]);

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
        domainRef={domainRef}
        values={values}
        loading={loading}
        handleValues={handleValues}
        handleDomain={handleDomain}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
      />
    </>
  );
};

AuthLoginPage.getInitialProps = (ctx) => {
  const { username, domain } = Cookie.get(ctx);

  return {
    initUsername: username || '',
    initDomain: domain || '',
    namespacesRequired: includeDefaultNamespaces(['login']),
  };
};

export default nextI18next.withTranslation('login')(AuthLoginPage);
