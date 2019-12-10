/** @format */

// #region Imports NPM
import React, { useContext } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography, IconButton } from '@material-ui/core';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { ProfileContext } from '../../lib/context';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  }),
);

const ProfileEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const profile = useContext(ProfileContext);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        {profile && profile.user && (
          <Box display="flex" flexDirection="column" p={1}>
            <Link href={{ pathname: '/profile' }} passHref>
              <IconButton>
                <ArrowBackIcon />
              </IconButton>
            </Link>
          </Box>
        )}
      </Page>
    </>
  );
};

ProfileEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfileEdit);
