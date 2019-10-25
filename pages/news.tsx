/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Iframe from 'react-iframe';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
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

const News: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});
  const url = 'https://i-npz.ru/kngk/portal/portal_news/';

  return (
    <Page {...props}>
      <Iframe className={classes.root} url={url} sandbox="allow-scripts" />
    </Page>
  );
};

News.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['news']),
  };
};

export default nextI18next.withTranslation('news')(News);
