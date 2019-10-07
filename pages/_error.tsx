/** @format */

// #region Imports NPM
import Head from 'next/head';
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// #endregion
// #region Imports Local
import Typography from '@material-ui/core/Typography';
import { I18nPage, Trans, includeDefaultNamespaces, useTranslation } from '../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme) => ({
  root: {},
  grid: {
    height: '100vh',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const ErrorPage: I18nPage = ({ statusCode, errorCode }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Head>
        <title>{t('_error:title')}</title>
      </Head>
      <Grid className={classes.grid} container direction="column" justify="center" alignItems="center">
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant="h5" component="h3">
              {t('_error:h1')} : {statusCode}
            </Typography>

            <Typography component="p">
              <Trans i18nKey="_error:explanation">
                <a href="mailto:webmaster@kngk-group.ru">email</a>
              </Trans>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  return {
    statusCode: res ? res.statusCode : 200,
    errorCode: err ? err.statusCode : 404,
    namespacesRequired: includeDefaultNamespaces([]),
  };
};

export default ErrorPage;
