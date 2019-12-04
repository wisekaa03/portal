/** @format */

// #region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
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

const MyProfile: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...props}>
        <VerticalCenter horizontal>
          <Paper className={classes.root}>
            <Typography>Извините, профиль пользователя пока не готов.</Typography>
          </Paper>
        </VerticalCenter>
      </Page>
    </>
  );
};

MyProfile.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['profile']),
  };
};

export default nextI18next.withTranslation('profile')(MyProfile);
