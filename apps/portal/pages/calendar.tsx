/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MaterialUI } from '@front/layout';
import { VerticalCenter } from '@front/components/vertical-center';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(5),
    },
  }),
);

const CalendarPage: I18nPage = ({ t, ...rest }) => {
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('calendar:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <VerticalCenter horizontal>
          <Paper className={classes.root}>
            <Typography>Извините, календарь компании пока не готов.</Typography>
          </Paper>
        </VerticalCenter>
      </MaterialUI>
    </>
  );
};

CalendarPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['calendar']),
});

export default nextI18next.withTranslation('calendar')(CalendarPage);
