/** @format */

// #region Imports NPM
import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography, IconButton } from '@material-ui/core';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useLazyQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
// #endregion
// #region Imports Local
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { ProfileContext } from '../../lib/context';
import { PROFILE } from '../../lib/queries';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
  }),
);

const ProfileEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [getProfile, { loading, error, data }] = useLazyQuery(PROFILE);
  const [current, setCurrent] = useState<any>({});
  const profile = useContext(ProfileContext);
  const isAdmin = profile && profile.user && profile.user.isAdmin;
  const router = useRouter();

  // TODO: пока так, потом переделать с выводом ошибок
  useEffect(() => {
    if (isAdmin && router && router.query && router.query.id) {
      getProfile({
        variables: { id: router.query.id },
      });
    } else {
      setCurrent(profile.user.profile);
    }
  }, [isAdmin, getProfile, router, profile.user]);

  useEffect(() => {
    if (isAdmin && !loading) {
      if (!error && data && data.profile) {
        setCurrent(data.profile);
      } else {
        setCurrent(profile.user.profile);
      }
    }
  }, [loading, data, isAdmin, error, profile.user.profile]);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column" p={2}>
          <Box display="flex">
            <Link href={{ pathname: '/profile' }} passHref>
              <IconButton>
                <ArrowBackIcon />
              </IconButton>
            </Link>
          </Box>
          <Box display="flex">{current && current.username}</Box>
        </Box>
      </Page>
    </>
  );
};

ProfileEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfileEdit);
