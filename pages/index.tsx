/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Paper } from '@material-ui/core';
// #endregion
// #region Imports Local
import Head from 'next/head';
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

  return (
    <>
      <Head>{t('common:title')}</Head>
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

HomePage.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces([]),
  };
};

export default nextI18next.withTranslation()(HomePage);
