/** @format */

// #region Imports NPM
import React from 'react';
import Head from 'next/head';
import { makeStyles, createStyles } from '@material-ui/core/styles';
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

const Meetings: I18nPage = (props): React.ReactElement => {
  const { t } = props;
  const classes = useStyles({});
  const url = 'https://ww.kngk-group.ru/site3/';

  return (
    <>
      <Head>
        <title>{t('meeting:title')}</title>
      </Head>
      <Page {...props}>
        <Iframe className={classes.root} url={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      </Page>
    </>
  );
};

Meetings.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['meeting']),
});

export default nextI18next.withTranslation('meeting')(Meetings);
