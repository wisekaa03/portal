/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  return (
    <Page {...rest}>
      <Head>
        <title>{t('media:add:title')}</title>
      </Head>
    </Page>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
