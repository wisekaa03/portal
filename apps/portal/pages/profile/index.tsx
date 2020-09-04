/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import Box from '@material-ui/core/Box';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MaterialUI } from '@front/layout';
import ProfileInfoComponent from '@front/components/profile/info';
import ProfileSettingsComponent from '@front/components/profile/settings';
//#endregion

const ProfilePage: I18nPage = ({ t, ...rest }): React.ReactElement => (
  <>
    <Head>
      <title>{t('profile:title')}</title>
    </Head>
    <MaterialUI {...rest}>
      <Box display="flex" flexDirection="column" p={1}>
        <ProfileInfoComponent />
        <ProfileSettingsComponent />
      </Box>
    </MaterialUI>
  </>
);

ProfilePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfilePage);
