/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA_EDIT } from '../../lib/queries';
// #endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [mediaEdit] = useMutation(MEDIA_EDIT);
  const router = useRouter();
  const title = router.query.id ? 'media:edit:title' : 'media:add:title';

  return (
    <Page {...rest}>
      <Head>
        <title>{t(title)}</title>
      </Head>
    </Page>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
