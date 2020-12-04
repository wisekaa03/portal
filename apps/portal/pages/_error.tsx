/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Grid } from '@material-ui/core';
//#endregion
//#region Imports Local
import { I18nPage, Trans, includeDefaultNamespaces, nextI18next } from '@lib/i18n-client';
import { MaterialUI } from '@front/layout';
//#endregion

const useStyles = makeStyles((theme) => ({
  root: {},
  grid: {
    height: '100vh',
    flexGrow: 1,
    padding: theme.spacing(6),

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  paper: {
    padding: theme.spacing(16),
    textAlign: 'center',
    color: theme.palette.text.secondary,

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3),
    },
  },
  statusCode: {
    padding: theme.spacing(5),
  },
}));

const title = (statusCode?: number): string => {
  switch (statusCode) {
    case 500:
      return 'error:title:server';
    case 403:
      return 'error:title:notauthorized';
    default:
      return 'error:title:notfound';
  }
};

const description = (statusCode?: number): string => {
  switch (statusCode) {
    case 500:
      return 'error:description:server';
    case 403:
      return 'error:description:notauthorized';
    default:
      return 'error:description:notfound';
  }
};

const ErrorPage: I18nPage<{ statusCode?: number }> = ({ statusCode, t, ...rest }) => {
  const classes = useStyles({});
  const href = `mailto:webmaster@${process.env.DOMAIN}`;

  return (
    <>
      <Head>
        <title>{t(title(statusCode))}</title>
      </Head>
      <MaterialUI {...rest}>
        <Grid className={classes.grid} container style={{ /* direction: 'column', */ justify: 'center', alignItems: 'center' }}>
          <Grid item>
            <Paper className={classes.paper}>
              <Typography variant="h3" component="h3">
                {t(description(statusCode))}
              </Typography>

              <Typography variant="h1" component="h1" className={classes.statusCode}>
                {statusCode}
              </Typography>

              <Typography component="p">
                <Trans i18nKey="error:explanation">
                  <a href={href}>email</a>
                </Trans>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </MaterialUI>
    </>
  );
};

ErrorPage.getInitialProps = async ({ res, err }) => ({
  statusCode: res ? res.statusCode : err ? err.statusCode : 404,
  namespacesRequired: includeDefaultNamespaces(['error']),
});

export default nextI18next.withTranslation('error')(ErrorPage);
