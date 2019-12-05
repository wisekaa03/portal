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

const Mail: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});
  const { to } = __SERVER__ ? { to: false } : queryString.parse(window.location.search);
  const mailUrl = process.env.MAIL_URL;
  const url = `${mailUrl}${to ? `?_task=mail&_action=compose&to=${to}` : ''}`;

  return (
    <>
      <Head>
        <title>{t('mail:title')}</title>
      </Head>
      <Page {...props}>
        <Iframe
          className={classes.root}
          url={url}
          // eslint-disable-next-line max-len
          sandbox="allow-scripts allow-same-origin allow-top-navigation allow-forms allow-popups allow-pointer-lock allow-popups-to-escape-sandbox"
        />
      </Page>
    </>
  );
};

Mail.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['mail']),
});

export default nextI18next.withTranslation('mail')(Mail);
