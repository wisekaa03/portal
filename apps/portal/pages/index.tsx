/** @format */

//#region Imports NPM
import React from 'react';
// import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import Head from 'next/head';
//#endregion
//#region Imports Local
import { FIRST_PAGE } from '@lib/constants';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MaterialUI } from '@front/layout';
//#endregion

const HomePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  if (!__SERVER__) {
    useRouter().push({ pathname: FIRST_PAGE });
  }

  return (
    <>
      <Head>
        <title>{t('common:title')}</title>
      </Head>
      <MaterialUI {...rest} />
    </>
  );
};

HomePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces([]),
});

export default nextI18next.withTranslation()(HomePage);
