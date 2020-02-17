/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { FetchResult } from 'apollo-link';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  Checkbox,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  TextField,
} from '@material-ui/core';

import queryString from 'query-string';
import Router from 'next/router';
// #endregion
// #region Imports Local
import snackbarUtils from '../../lib/snackbar-utils';
import { Loading } from '../../components/loading';
import { LOGIN } from '../../lib/queries';
import { Data } from '../../lib/types';
import { FIRST_PAGE, SESSION } from '../../lib/constants';
import { UserResponse } from '../../src/user/user.entity';
import { getStorage, setStorage, removeStorage } from '../../lib/session-storage';
import Background2 from '../../public/images/svg/background2.svg';
import Logo from '../../public/images/svg/logo.svg';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundSize: 'cover',
      backgroundImage: `url(${Background2})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom center',
      height: '100vh',
    },
    logo: {
      height: '11vh',
      margin: '10px auto',
      width: '100%',
    },
    loginContainer: {
      height: '70vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    card: {
      width: 600,
      maxWidth: '95vw',
      padding: theme.spacing(4),
      backgroundColor: 'rgba(255,255,255,0.5)',
      color: '#2c4373',
      border: 'solid 3px #2c4373',
      borderRadius: 16,
      paddingLeft: 24,
    },
    typoAuthorization: {
      color: '#2c4373',
      textAlign: 'left',
      marginBottom: theme.spacing(),
    },
    labelForFormControl: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    labelForCheckbox: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      width: '100%',
    },
    formControl: {
      margin: theme.spacing(1, 0),

      [theme.breakpoints.up('sm')]: {
        minWidth: 320,
      },
    },
    submitButtonContainer: {
      width: '100%',
    },
    submitButton: {
      'borderRadius': 24,
      'width': 'fit-content',
      'marginTop': theme.spacing(),

      '&:disabled': {
        color: '#2c4373',
        borderRadius: 24,
        marginTop: theme.spacing(),
      },

      '&:hover': {
        color: '#2c4373',
      },
    },
  }),
);

interface LoginState {
  save: boolean;
  user: string;
  pass: string;
}

const Login: I18nPage = ({ t }): React.ReactElement => {
  const classes: any = useStyles({});
  const client = useApolloClient();
  const [values, setValues] = useState<LoginState>({
    save: false,
    user: '',
    pass: '',
  });

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

  const handleChange = (name: keyof LoginState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean = el.type === 'checkbox' ? el.checked : el.value;

    setValues({ ...values, [name]: value });
    if (name !== 'pass') {
      setStorage(name, value.toString());
    }
  };

  const handleSubmit = (): void => {
    login({
      variables: {
        username: values.user,
        password: values.pass,
      },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (error) {
      snackbarUtils.show(error);
    }
  }, [error]);

  useEffect(() => {
    const save = getStorage('save');

    if (save === 'true') {
      setValues({
        save: true,
        user: getStorage('user'),
        // секурити риск ! :)
        pass: '' /* || getStorage('pass'), */,
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>{t('login:title')}</title>
      </Head>
      <div className={classes.root}>
        <div>
          <img src={Logo} alt="Logo" className={classes.logo} />
        </div>
        <div className={classes.loginContainer}>
          <Card className={classes.card}>
            <CardContent onKeyDown={handleKeyDown}>
              <Typography className={classes.typoAuthorization} variant="h4">
                {t('common:authorization')}
              </Typography>
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <TextField
                  data-field-name="username"
                  type="username"
                  autoFocus
                  value={values.user}
                  onChange={handleChange('user')}
                  disabled={loading}
                  label={t('login:username')}
                  variant="outlined"
                  className={classes.labelForFormControl}
                />
              </FormControl>
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <TextField
                  data-field-name="password"
                  type="password"
                  value={values.pass}
                  onChange={handleChange('pass')}
                  disabled={loading}
                  label={t('login:password')}
                  variant="outlined"
                  className={classes.labelForFormControl}
                />
              </FormControl>
              <FormControlLabel
                className={classes.labelForCheckbox}
                control={
                  <Checkbox
                    checked={values.save}
                    onChange={handleChange('save')}
                    value="save"
                    color="primary"
                    disabled={loading}
                  />
                }
                label={t('remember')}
              />
              {loading && <Loading />}
              <FormControl className={classes.submitButtonContainer}>
                <Button
                  className={classes.submitButton}
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="large"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {t('signIn')}
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

Login.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['login']),
});

export default nextI18next.withTranslation('login')(Login);
