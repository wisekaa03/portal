/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
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

const FAQ: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Page {...props}>
      <Typography className={classes.root}>Извините, база знаний пока не готова. Ожидайте.</Typography>
    </Page>
  );
};

FAQ.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['faq']),
  };
};

export default nextI18next.withTranslation('faq')(FAQ);
