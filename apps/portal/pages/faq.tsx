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

const FAQ: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('faq:title')}</title>
      </Head>
      <Page {...props}>
        <VerticalCenter horizontal>
          <Paper className={classes.root}>
            <Typography>Извините, база знаний пока не готова.</Typography>
          </Paper>
        </VerticalCenter>
      </Page>
    </>
  );
};

FAQ.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['faq']),
  };
};

export default nextI18next.withTranslation('faq')(FAQ);
