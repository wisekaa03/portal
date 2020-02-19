/** @format */

// #region Imports NPM
import React, { useEffect } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import Head from 'next/head';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { VerticalCenter } from '../components/verticalcenter';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(5),
    },
  }),
);

const HomePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  if (!__SERVER__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/_next/static/sw.js')
          .then((/* registration */) => {
            return console.log('service worker registration successful');
          })
          .catch((err) => {
            console.warn('service worker registration failed', err.message);
          });
      }
    }, []);
  }

  return (
    <>
      <Head>
        <title>{t('common:title')}</title>
      </Head>
      <Page {...rest}>
        <VerticalCenter horizontal>
          <Paper className={classes.root}>
            <Typography>Извините, данный модуль пока не готов.</Typography>
          </Paper>
        </VerticalCenter>
      </Page>
    </>
  );
};

HomePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces([]),
});

export default nextI18next.withTranslation()(HomePage);
