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
import Background2 from '../public/images/svg/background2.svg';
import Logo from '../public/images/svg/logo.svg';
import { I18nPage, includeDefaultNamespaces, useTranslation } from '../lib/i18n-client';
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
    logoutContainer: {
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

interface LogoutProps {
  error?: ApolloError;
  loading: boolean;
  logout: MutationFunction;
}

interface State {
  save: boolean;
  name: string;
  pass: string;
}

export const LogoutComponent = (props: LogoutProps): React.ReactElement => {
  const { error, loading, logout } = props;
  const { t, i18n } = useTranslation();

  const classes: any = useStyles({});

  return (
    <div className={classes.root}>
      <div>
        <img src={Logo} alt="Logo" className={classes.logo} />
      </div>
      <div className={classes.logoutContainer}>
        <form
          onSubmit={async (e: any): Promise<void> => {
            e.preventDefault();
            logout();
          }}
          className={classes.container}
          autoComplete="off"
          noValidate
        >
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.typoAuthorization} variant="h4">
                {t('logout:authorization')}
              </Typography>
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
                  {t('logout:signOut')}
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

LogoutComponent.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['logout']),
  };
};
