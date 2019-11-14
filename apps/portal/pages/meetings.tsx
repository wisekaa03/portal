/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
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

const Meetings: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Page {...props}>
      <VerticalCenter horizontal>
        <Paper className={classes.root}>
          <Typography>Извините, бронирование переговорных пока не готово.</Typography>
        </Paper>
      </VerticalCenter>
    </Page>
  );
};

Meetings.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['meeting']),
  };
};

export default nextI18next.withTranslation('meeting')(Meetings);
