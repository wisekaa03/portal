/** @format */

//#region Imports NPM
import React from 'react';
// import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import Head from 'next/head';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { VerticalCenter } from '../components/vertical-center';
//#endregion

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       padding: theme.spacing(5),
//     },
//   }),
// );

const HomePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  // const classes = useStyles({});
  const router = useRouter();

  router.push({ pathname: '/phonebook' });

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
