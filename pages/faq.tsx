/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Paper } from '@material-ui/core';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import { VerticalCenter } from '../components/verticalcenter';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(5),
    },
  }),
);

const FAQ: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Page {...props}>
      <VerticalCenter horizontal>
        <Paper className={classes.root}>
          <Typography>Извините, база знаний пока не готова. Ожидайте.</Typography>
        </Paper>
      </VerticalCenter>
    </Page>
  );
};

FAQ.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['faq']),
  };
};

export default nextI18next.withTranslation('faq')(FAQ);
