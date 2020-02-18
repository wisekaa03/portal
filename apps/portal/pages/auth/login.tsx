/** @format */

// #region Imports NPM
import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { FetchResult } from 'apollo-link';
import queryString from 'query-string';
import Router from 'next/router';
// #endregion
// #region Imports Local
import LoginComponent from '../../components/login';
import { LoginValuesProps } from '../../components/login/types';
import snackbarUtils from '../../lib/snackbar-utils';
import { LOGIN } from '../../lib/queries';
import { Data } from '../../lib/types';
import { FIRST_PAGE, SESSION } from '../../lib/constants';
import { UserResponse } from '../../src/user/user.entity';
import { getStorage, setStorage, removeStorage } from '../../lib/session-storage';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../../lib/i18n-client';
// #endregion

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       backgroundSize: 'cover',
//       backgroundImage: `url(${Background2})`,
//       backgroundRepeat: 'no-repeat',
//       backgroundPosition: 'bottom center',
//       height: '100vh',
//     },
//     logo: {
//       height: '11vh',
//       margin: '10px auto',
//       width: '100%',
//     },
//     loginContainer: {
//       height: '70vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       textAlign: 'center',
//     },
//     card: {
//       width: 600,
//       maxWidth: '95vw',
//       padding: theme.spacing(4),
//       backgroundColor: 'rgba(255,255,255,0.5)',
//       color: '#2c4373',
//       border: 'solid 3px #2c4373',
//       borderRadius: 16,
//       paddingLeft: 24,
//     },
//     typoAuthorization: {
//       color: '#2c4373',
//       textAlign: 'left',
//       marginBottom: theme.spacing(),
//     },
//     labelForFormControl: {
//       borderColor: 'rgba(44, 67, 115, 0.4)',
//     },
//     labelForCheckbox: {
//       borderColor: 'rgba(44, 67, 115, 0.4)',
//       width: '100%',
//     },
//     formControl: {
//       margin: theme.spacing(1, 0),

//       [theme.breakpoints.up('sm')]: {
//         minWidth: 320,
//       },
//     },
//     submitButtonContainer: {
//       width: '100%',
//     },
//     submitButton: {
//       'borderRadius': 24,
//       'width': 'fit-content',
//       'marginTop': theme.spacing(),

//       '&:disabled': {
//         color: '#2c4373',
//         borderRadius: 24,
//         marginTop: theme.spacing(),
//       },

//       '&:hover': {
//         color: '#2c4373',
//       },
//     },
//   }),
// );

const Login: I18nPage = ({ t }): React.ReactElement => {
  const client = useApolloClient();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const getInitialValues = (): LoginValuesProps => {
    // TODO: localStorage бесполезен при ssr надо продумать, либо отказаться от этого функционала
    const save = false; // = getStorage('save') === 'true';

    return {
      save,
      username: save ? getStorage('user') : '',
      password: '',
    };
  };

  const [values, setValues] = useState<LoginValuesProps>(getInitialValues);

  const [login, { loading, error }] = useMutation(LOGIN, {
    update(_cache, { data }: FetchResult<Data<'data', UserResponse>>) {
      if (data && data.login) {
        setStorage(SESSION, data.login.session || '');
        client.resetStore();

        const { redirect = FIRST_PAGE } = queryString.parse(window.location.search);
        Router.push(redirect as string);
      } else {
        removeStorage(SESSION);
      }
    },
  });

  const handleValues = (name: keyof LoginValuesProps) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean = el.type === 'checkbox' ? el.checked : el.value;

    setValues({ ...values, [name]: value });
    if (name !== 'password') {
      setStorage(name, value.toString());
    }
  };

  const handleSubmit = (): void => {
    const { username, password } = values;

    if (username.trim() === '') {
      usernameRef!.current!.focus();
    } else if (password.trim() === '') {
      passwordRef!.current!.focus();
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
    if (error) {
      snackbarUtils.error(error);
    }
  }, [error]);

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

Login.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['login']),
});

export default nextI18next.withTranslation('login')(Login);
