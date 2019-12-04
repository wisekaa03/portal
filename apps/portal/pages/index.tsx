/** @format */

// #region Imports NPM
import React from 'react';
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

const HomePage: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('common:title')}</title>
      </Head>
      <Page {...props}>
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
