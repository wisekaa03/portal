/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';

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

import { MutationFunction } from 'react-apollo';
import { ApolloError } from 'apollo-client';
// #endregion
// #region Imports Local
import { GQLError } from './gql-error';
import { Loading } from './loading';
import { getStorage, setStorage } from '../lib/session-storage';
import LogoComponent from '../static/images/svg/logo.svg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundSize: 'cover',
      backgroundImage: 'url(/images/svg/background2.svg)',
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
    container: {
      width: 600,
      maxWidth: '95vw',
      margin: `${theme.spacing(2)}px auto`,
    },
    card: {
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
      marginBottom: theme.spacing(1),
    },
    labelForFormControl: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    labelForCheckbox: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      width: '100%',
    },
    formControl: {
      margin: `${theme.spacing(1)}px 0`,

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
      'marginTop': `${theme.spacing(1)}px`,

      '&:disabled': {
        color: '#2c4373',
        borderRadius: 24,
        marginTop: `${theme.spacing(1)}px`,
      },

      '&:hover': {
        color: '#2c4373',
      },
    },
  }),
);

interface LoginProps {
  error?: ApolloError;
  loading: boolean;
  login: MutationFunction;
}

interface State {
  save: boolean;
  name: string;
  pass: string;
}

export const LoginComponent = (props: LoginProps): React.ReactElement => {
  const { error, loading, login } = props;

  const classes: any = useStyles({});

  const [values, setValues] = useState<State>({
    save: false,
    name: '',
    pass: '',
  });

  const handleChange = (name: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean = el.type === 'checkbox' ? el.checked : el.value;

    setValues({ ...values, [name]: value });
    setStorage(`user.${name}`, value.toString());
  };

  useEffect(() => {
    const save: string = getStorage('user.save');

    if (save === 'true') {
      setValues({
        save: true,
        name: getStorage('user.name'),
        pass: getStorage('user.pass'),
      });
    }
  }, []);

  return (
    <div className={classes.root}>
      <div>
        <LogoComponent alt="Logo" className={classes.logo} />
      </div>
      <div className={classes.loginContainer}>
        <form
          onSubmit={async (e: any): Promise<void> => {
            e.preventDefault();

            login({
              variables: {
                username: values.name,
                password: values.pass,
              },
            });
          }}
          className={classes.container}
          autoComplete="off"
          noValidate
        >
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.typoAuthorization} variant="h4">
                Авторизация
              </Typography>
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <TextField
                  type="username"
                  value={values.name}
                  onChange={handleChange('name')}
                  disabled={loading}
                  label="Пользователь"
                  variant="outlined"
                  className={classes.labelForFormControl}
                />
              </FormControl>
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <TextField
                  type="password"
                  value={values.pass}
                  onChange={handleChange('pass')}
                  disabled={loading}
                  label="Пароль"
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
                label="Запомнить меня на этом компьютере"
              />
              {loading && <Loading />}
              {error && <GQLError error={error} />}
              <FormControl className={classes.submitButtonContainer}>
                <Button
                  className={classes.submitButton}
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  Вход
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};
