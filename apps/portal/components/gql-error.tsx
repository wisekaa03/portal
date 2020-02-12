/** @format */

// #region Imports NPM
import React, { useState } from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { GraphQLError } from 'graphql';
import { ApolloError } from 'apollo-client';

import { nextI18next, I18nPage, includeDefaultNamespaces } from '../lib/i18n-client';
// #endregion
// #region Imports Local
// #endregion

const useStyles = makeStyles(() =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errors: {
      color: 'red',
    },
  }),
);

interface GQLErrorProps {
  error: ApolloError;
}

// TODO: сделать что-нибудь с отображением ошибок
const BaseGQLError: I18nPage<GQLErrorProps> = ({ error, t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [open, setOpen] = useState(true);

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="error" className={classes.modal}>
      <DialogTitle>{t('error:title.server')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Typography className={classes.errors} variant="h6">
            {error.graphQLErrors.map(
              (value: GraphQLError) =>
                `Ошибка: ${typeof value.message === 'object' ? (value.message as any).message : value.message}`,
            )}
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          {t('common:cancel')}
        </Button>
      </DialogActions>{' '}
    </Dialog>
  );
};

export default nextI18next.withTranslation('error')(BaseGQLError);
