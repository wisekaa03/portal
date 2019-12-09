/** @format */

// #region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(5),
    },
  }),
);

const ProfileEquipment: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>Оборудование</Page>
    </>
  );
};

ProfileEquipment.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfileEquipment);
