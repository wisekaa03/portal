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
import { I18nPage, Trans, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme) => ({
  root: {},
  grid: {
    height: '100vh',
    flexGrow: 1,
    padding: '50px',
  },
  paper: {
    padding: theme.spacing(16),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  statusCode: {
    padding: theme.spacing(5),
  },
}));

const ErrorPage: I18nPage<{ statusCode?: number }> = ({ statusCode, t }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Head>
        <title>{t('error:title')}</title>
      </Head>
      <Grid className={classes.grid} container direction="column" justify="center" alignItems="center">
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant="h3" component="h3">
              {t('error:description')}
            </Typography>

            <Typography variant="h1" component="h1" className={classes.statusCode}>
              {statusCode}
            </Typography>

            <Typography component="p">
              <Trans i18nKey="error:explanation">
                <a href="mailto:webmaster@kngk-group.ru">email</a>
              </Trans>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }) => ({
  statusCode: res ? res.statusCode : err ? err.statusCode : 404,
  namespacesRequired: includeDefaultNamespaces(['error']),
});

export default nextI18next.withTranslation('error')(ErrorPage);
