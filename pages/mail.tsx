/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Iframe from 'react-iframe';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
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

const Mail = (): React.ReactElement => {
  const classes = useStyles({});
  const url = 'https://mail.kngk-group.ru';

  return (
    <Page>
      <Iframe className={classes.root} url={url} sandbox="allow-same-origin" />
    </Page>
  );
};

Mail.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['mail']),
  };
};

export default nextI18next.withTranslation('mail')(Mail);
