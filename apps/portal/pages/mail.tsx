/** @format */

// #region Imports NPM
import React from 'react';
import Head from 'next/head';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import queryString from 'query-string';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import Iframe from '../components/iframe';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
// #endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'block',
      border: 'none',
      height: '100%',
      width: '100%',
    },
  }),
);

const Mail: I18nPage = ({ t, ...rest }: any): React.ReactElement => {
  const classes = useStyles({});
  const { to } = __SERVER__ ? { to: false } : queryString.parse(window.location.search);
  const url = `https://roundcube.i-npz.ru/${to ? `?_task=mail&_action=compose&to=${to}` : ''}`;

  return (
    <Page {...rest}>
      <Head>
        <title>{t('mail:title')}</title>
      </Head>
      <Iframe className={classes.root} url={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </Page>
  );
};

Mail.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['mail']),
});

export default nextI18next.withTranslation('mail')(Mail);
